# Architecture Context

Gadded retains its **notebook-first Python proof of concept** as the graded artifact.
On 2026-10-30 the user explicitly requested replacing the Streamlit pitch UI with
React + TypeScript + Tailwind. A thin FastAPI adapter reuses the existing Python
engine; Nginx serves the Vite build and proxies `/api` in Docker Compose. No database,
queue, or auth is added. The notebook remains supported.

## Repository organization

The user authorized the React migration and this backend organization on 2026-10-30.

- `backend/` owns Python packaging, requirements, Dockerfile, source, and unit/integration tests.
- `backend/src/gadded/` separates `api`, `application`, `core`, `energy`, `economics`,
  `siting`, `regulatory`, `discovery`, `integrations`, and `reporting`.
- `contracts.py` is canonical; `gadded.main:app` composes thin HTTP routers.
- `application/assessment.py` orchestrates existing analytical modules.
  `application/resources.py` loads cached datasets/models into named resources.
- `frontend/` contains React/TypeScript, Vite, compiled Tailwind, Recharts, and Lucide.
- Root `gadded.ipynb` and `data/` remain discoverable for the graded showcase.
- `core/config.py` resolves data and generated-output paths independently of CWD.
  `GADDED_DATA_DIR` and `GADDED_ARTIFACT_DIR` provide explicit deployment overrides.
- `artifacts/` contains generated reports/models. `docs/` contains the graded PDF
  and current architecture guide. `legacy/streamlit/` archives the old interface.
- Root `compose.yaml` builds `backend/Dockerfile` and the frontend. `Makefile` exposes
  common commands. No database, queue, auth, or new live provider calls are added.
- API routes/JSON shapes, UI/locales, numerical behavior, and citation rules are preserved.
- Results live in browser memory; edits mark existing results as a previous run.
- Live AI remains opt-in and unconfigured until the user supplies `.env`.

See `docs/architecture.md` for the dependency rules and import migration map.

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Language | Python 3.12+ | All logic |
| Orchestration | Jupyter notebook (`gadded.ipynb`) | Runs the full pipeline on the golden case, renders charts |
| Contracts | Pydantic | Canonical typed shapes shared across modules |
| Data / math | pandas, NumPy | Series, tables, units |
| PV physics | pvlib | Hourly PV generation |
| ML | scikit-learn | Load-profile clustering + archetype classifier |
| Finance | numpy-financial | NPV, IRR, amortization, payback |
| Risk | NumPy | Monte Carlo + sensitivity |
| Geospatial | Shapely | Point-in-polygon, distance on local GeoJSON |
| Retrieval | TF-IDF cosine (scikit-learn) | Regulatory RAG over ~10 local excerpt chunks (no vector DB, no embeddings API) |
| Optional LLM | Gemini + Groq | Gemini handles retrieval/explanation and JSON extraction; Groq Compound supplies evidence-grounded search. Unconfigured by default. |
| Charts | matplotlib | Notebook + report visuals |
| Report | Jinja2 HTML (optional PDF) | Combined assessment artifact |
| Tests | pytest | Formula, reconciliation, evidence checks |

## Repository shape

```text
backend/
  pyproject.toml
  requirements/runtime.txt
  Dockerfile
  src/gadded/
    main.py
    contracts.py
    api/routes/
    application/
    core/
    energy/
    economics/
    siting/
    regulatory/
    discovery/
    integrations/
    reporting/
  tests/unit/
  tests/integration/
frontend/
data/
docs/
context/
artifacts/
legacy/streamlit/
gadded.ipynb
compose.yaml
Makefile
```

## Module boundaries

- Pure calculation functions in PV, matching, sizing, economics, and feasibility accept
  explicit inputs and make no network/file calls. Load archetype reads and model
  save/load functions are explicit I/O boundaries within the load modules.
- I/O lives at the edges: `integrations`, `application.resources`, `regulatory`, `discovery`, and `reporting`.
- `contracts.py` is the single source of shapes. No module invents a competing shape for assessment input, hourly series, GIS finding, regulatory finding, financial scenario, vendor evidence, or final result.
- Do not mix regulatory reasoning, engineering calculation, and LLM prompting in one module.

## Pipeline (what the notebook runs)

```text
golden_case.json
  -> validate (contracts)
  -> weather (cached)
  -> load (ML profile, reconciled to monthly kWh)
  -> pv (pvlib, per candidate size)
  -> matching (hourly self/import/export)
  -> optimization (pick capacity by NPV, not largest)
  -> finance (cash + finance) -> risk (Monte Carlo)
  -> gis (site screening) 
  -> regulatory (retrieve -> rules -> cited explanation)
  -> feasibility (deterministic status)
  -> vendors (LLM web search, evidence-gated)
  -> report (AssessmentResult -> HTML)
```

## Hackathon swaps (deliberate, from the full-product spec)

- pgvector → TF-IDF cosine (scikit-learn) over a local excerpt corpus (only ~10 chunks).
- PostGIS → Shapely on local GeoJSON.
- Supabase / Next.js / Celery / Redis / auth → removed.
- OpenAI Responses API → hybrid Gemini explanation/extraction and Groq Compound search.
- Live NASA POWER call → one cached CSV committed to the repo.
- Model weights / large datasets → not committed; described in the doc (submission size limits).

## AI and analytics boundaries

- **Load profile (ML):** cluster normalized curves into archetypes, classify user inputs to an archetype/shape, then scale to reconcile to submitted monthly kWh. Preserve model version, features, archetype, confidence; low confidence falls back to the deterministic archetype with a warning.
- **PV (physics):** `pvlib`. Not machine learning. Preserve weather source, tilt, azimuth, loss, model version.
- **Optimization:** constrained; objective and constraints inspectable; recommendation reproducible from frozen inputs; must not simply pick the largest size.
- **Finance / risk:** deterministic formulas, tested; Monte Carlo seeded; show P10/P50/P90 and sensitivity.
- **Regulatory:** retrieve (TF-IDF) → apply deterministic versioned rules → LLM (`gemini-flash-latest`) explains only retrieved evidence + applied rules. The LLM never invents a permit, threshold, authority, duration, or eligibility decision.
- **Vendors:** `groq/compound` web-search agent, strict structured output (extracted by a second `gemini-flash-latest` pass constrained to the returned search evidence only), ≥1 accessible source per candidate, contact fields null when unsupported, no quality ranking.

## Invariants

1. LLM text never decides eligibility or overall status — rules and cited evidence do.
2. Engineering and financial calculations are deterministic and independently tested.
3. Every recommendation ties to frozen inputs, assumptions, and model/prompt versions.
4. GIS never implies authoritative completeness; missing coverage returns `unknown`.
5. A displayed vendor always has source evidence.
6. External data used by the demo is cached/versioned for reproducibility.
7. Predicted load totals reconcile with submitted monthly totals within documented tolerance.
8. The report is assembled from stored structured outputs, not recomputed.
9. The PoC supports only industrial rooftop solar in the selected geography.
