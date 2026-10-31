"""Presentation-independent orchestration for the local React demo.

All calculations and decisions stay in the existing owned analytical modules.
The response contains aggregates of the optimized hourly match, plus a report
rendered from those same computed outputs. Nothing is persisted between runs.
"""
from __future__ import annotations

import calendar
import os
from datetime import UTC, datetime
from uuid import uuid4

from gadded.contracts import AssessmentInput, ResultVersions
from gadded.application.feasibility import resolve_feasibility
from gadded.economics.finance import build_scenarios
from gadded.discovery.financing import discover_financing_options
from gadded.siting.gis import screen_site
from gadded.energy.load_ml import predict_load_ml
from gadded.energy.optimization import optimize_capacity
from gadded.regulatory.engine import (
    build_context, evaluate_rules, explain_with_llm, retrieve,
)
from gadded.reporting.report import assemble_result, render_html
from gadded.economics.risk import RiskInputs, run_monte_carlo
from gadded.discovery.vendors import discover_vendors
from gadded.application.resources import get_resources
from gadded.core.constants import COVERAGE_NOTICE

def run_assessment(ai: AssessmentInput, run_llm: bool = False) -> dict:
    """Execute one bounded demo assessment and serialize its presentation outputs."""
    resources = get_resources()
    a, weather, bundle = resources.assumptions, resources.weather, resources.load_model
    zones, corpus, rules = resources.zones, resources.regulatory_corpus, resources.regulatory_rules
    load = predict_load_ml(ai, weather.frame.index, bundle, a.number("reconciliation_tolerance_pct"))
    opt = optimize_capacity(ai, weather, load.series["load_kw"], a)
    rec = opt.recommendation
    row = opt.table.loc[rec.recommendedCapacityKw]
    financial = build_scenarios(
        rec.recommendedCapacityKw, row["year1_savings_egp"], a, ai.finance.preference,
    )
    risk = run_monte_carlo(
        RiskInputs(
            capacity_kw=rec.recommendedCapacityKw,
            year1_pv_savings_egp=row["year1_savings_egp"], capex_egp=row["capex_egp"],
            opex_egp=rec.recommendedCapacityKw * a.number("opex_per_kw_year_egp"),
        ), a, target_payback_years=ai.finance.targetPaybackYears,
        seed=int(a.number("monte_carlo_seed")), runs=int(a.number("monte_carlo_runs")),
    )
    gis = screen_site(ai.location.latitude, ai.location.longitude, zones)
    findings = evaluate_rules(build_context(
        ai.connectionModel, ai.site.ownershipStatus, {f.code for f in gis}, rec.recommendedCapacityKw,
    ), rules, corpus)
    vendors, vendor_warnings, financing, financing_warnings = [], [], [], []
    explanation = None
    ai_warnings = []
    if run_llm:
        gemini = groq = None
        if os.getenv("GEMINI_API_KEY"):
            from google import genai
            gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"], http_options={"timeout": 60000})
        if os.getenv("GROQ_API_KEY"):
            from openai import OpenAI
            groq = OpenAI(api_key=os.environ["GROQ_API_KEY"], base_url="https://api.groq.com/openai/v1",
                          timeout=60, max_retries=1)
        if gemini:
            try:
                question = "Can this industrial rooftop solar project use the selected connection model?"
                passages = retrieve(question, corpus, top_k=2, client=gemini)
                explanation = explain_with_llm(question, passages, findings, gemini)
            except Exception:
                ai_warnings.append("Regulatory AI explanation unavailable. Cited deterministic findings remain available.")
        else:
            ai_warnings.append("GEMINI_API_KEY is not configured; regulatory AI explanation skipped.")
        if gemini and groq:
            try:
                vendors, vendor_warnings = discover_vendors(
                    ai.location.address or "10th of Ramadan City, Egypt", rec.recommendedCapacityKw,
                    ai.connectionModel, groq, gemini, max_candidates=5,
                )
            except Exception:
                vendor_warnings = ["Vendor search unavailable this run. Retry later."]
            try:
                financing, financing_warnings = discover_financing_options(
                    rec.recommendedCapacityKw, row["capex_egp"], groq, gemini, max_candidates=5,
                )
            except Exception:
                financing_warnings = ["Financing search unavailable this run. Retry later."]
        else:
            vendor_warnings = ["Live discovery requires both GEMINI_API_KEY and GROQ_API_KEY on the server."]
            financing_warnings = list(vendor_warnings)
    else:
        vendor_warnings = ["Live vendor search was not requested for this run."]
        financing_warnings = ["Live financing search was not requested for this run."]
    material = [w for w in load.result.warnings if "exceeds tolerance" in w or "empty archetype shape" in w]
    feasibility = resolve_feasibility(findings, gis, ai.site.ownershipStatus, material)
    result = assemble_result(
        run_id=f"run-{uuid4().hex[:12]}", assessment_id=ai.projectId, status=feasibility.status,
        technical=rec, financial=financial, risk=risk, gis_findings=gis,
        regulatory_findings=findings, vendors=vendors,
        warnings=[*load.result.warnings, COVERAGE_NOTICE, *ai_warnings, *vendor_warnings],
        versions=ResultVersions(code="gadded-react-0.2.0", assumptionSet=a.assumptionSet.id,
            loadModel=load.result.modelVersion, pvModel="pvlib-pvwatts-0.1.0",
            regulatoryPrompt="reg-explain-0.1.0", vendorPrompt="vendor-discovery-0.1.0"),
    )
    generated = datetime.now(UTC).isoformat()
    monthly = [{"month": calendar.month_abbr[int(month)], "load": round(r.load_kw, 2),
                "pv": round(r.pv_kw, 2), "selfConsumed": round(r.self_kwh, 2)}
               for month, r in opt.best_match.monthly.iterrows()]
    daily = opt.best_match.hourly.groupby(opt.best_match.hourly.index.hour).mean()
    return {
        "input": ai.model_dump(mode="json"), "result": result.model_dump(mode="json"),
        "generatedAt": generated, "reasons": feasibility.reasons, "runLlm": run_llm,
        "monthlyEnergy": monthly,
        "dailyEnergy": [{"hour": f"{hour:02d}:00", "load": round(r.load_kw, 2), "pv": round(r.pv_kw, 2)}
                        for hour, r in daily.iterrows()],
        "candidates": opt.table.reset_index(drop=True).round(3).to_dict(orient="records"),
        "loadModel": load.result.model_dump(mode="json"), "assumptions": a.model_dump(mode="json"),
        "regulatoryExplanation": explanation, "vendorWarnings": vendor_warnings,
        "financingOptions": [f.model_dump(mode="json") for f in financing],
        "financingWarnings": financing_warnings,
        "reportHtml": render_html(result, ai.projectName, generated),
    }
