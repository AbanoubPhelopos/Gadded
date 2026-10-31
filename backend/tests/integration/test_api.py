"""Offline HTTP integration: real golden pipeline, evidence, and validation."""
from copy import deepcopy

import pytest

pytest.importorskip("fastapi", reason="API integration tests require the backend runtime dependencies")
from fastapi.testclient import TestClient

from gadded.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def golden() -> dict:
    return client.get("/api/defaults").json()


@pytest.fixture(scope="module")
def completed(golden: dict) -> dict:
    response = client.post("/api/assessments", json={"assessment": golden})
    assert response.status_code == 200, response.text
    return response.json()


def test_health_and_metadata_do_not_expose_secrets() -> None:
    assert client.get("/api/health").json()["status"] == "ok"
    meta = client.get("/api/metadata").json()
    assert set(meta) == {"coverageNotice", "regulatoryAiAvailable", "discoveryAvailable"}


def test_golden_result_and_chart_reconciliation(completed: dict) -> None:
    result = completed["result"]
    assert result["status"] == "feasible_with_conditions"
    assert result["technical"]["recommendedCapacityKw"] > 0
    assert len(completed["monthlyEnergy"]) == 12
    assert len(completed["dailyEnergy"]) == 24
    assert sum(p["load"] for p in completed["monthlyEnergy"]) == pytest.approx(result["technical"]["annualLoadKwh"], abs=0.1)
    assert sum(p["pv"] for p in completed["monthlyEnergy"]) == pytest.approx(result["technical"]["annualGenerationKwh"], abs=0.1)
    assert result["risk"]["npvP10Egp"] <= result["risk"]["npvP50Egp"] <= result["risk"]["npvP90Egp"]
    assert all(f["citations"] or f["conclusion"] == "insufficient_information" for f in result["regulatoryFindings"])
    assert not completed["runLlm"]
    assert not result["vendors"]
    assert "not requested" in completed["vendorWarnings"][0]
    assert result["runId"] in completed["reportHtml"]


@pytest.mark.parametrize("lat,roof", [(31, 3000), (30.3203, -1), (30.3203, 30001)])
def test_rejects_invalid_or_unsupported_scope(golden: dict, lat: float, roof: float) -> None:
    values = deepcopy(golden)
    values["location"]["latitude"] = lat
    values["site"]["availableRoofAreaM2"] = roof
    assert client.post("/api/assessments", json={"assessment": values}).status_code == 422


@pytest.mark.parametrize("preset,status", [("ownership", "insufficient_information"), ("protected", "high_risk"), ("large", "feasible_with_conditions")])
def test_scenario_decisions(golden: dict, preset: str, status: str) -> None:
    values = deepcopy(golden)
    if preset == "ownership":
        values["site"]["ownershipStatus"] = "unknown"
    elif preset == "protected":
        values["location"].update(latitude=30.345, longitude=31.815)
    else:
        values["site"]["availableRoofAreaM2"] = 20000
    response = client.post("/api/assessments", json={"assessment": values})
    assert response.status_code == 200, response.text
    result = response.json()["result"]
    assert result["status"] == status
    if preset == "large":
        assert result["technical"]["recommendedCapacityKw"] < result["technical"]["physicalMaximumKw"]


def test_report_escapes_user_content(golden: dict) -> None:
    values = deepcopy(golden)
    values["projectName"] = '<script>alert("untrusted")</script>'
    response = client.post("/api/assessments", json={"assessment": values})
    assert response.status_code == 200
    html = response.json()["reportHtml"]
    assert "<script>" not in html
    assert "&lt;script&gt;" in html
