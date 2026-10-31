# Gadded backend

Install from the repository root with `python -m pip install -e './backend[dev,notebook]'`.
Start the API with `python -m uvicorn gadded.main:app --reload`.
Run tests with `python -m pytest -c backend/pyproject.toml backend/tests`.

## Responsibilities

| Package | Owns |
| --- | --- |
| `api/` | HTTP routes and request envelopes |
| `application/` | Assessment orchestration, shared resource loading, feasibility resolution |
| `core/` | Runtime paths and shared demo disclosures |
| `contracts.py` | Canonical Pydantic domain models |
| `energy/` | Load estimation/ML, PV physics, hourly matching, capacity optimization |
| `economics/` | Financial formulas and seeded Monte Carlo risk |
| `siting/` | Source-aware GIS screening |
| `regulatory/` | Evidence retrieval, deterministic rules, optional grounded explanation |
| `discovery/` | Evidence-gated vendor and financing discovery |
| `integrations/` | Weather I/O and shared provider adapters |
| `reporting/` | Result assembly and HTML report rendering |

HTTP routes delegate to application code. Domain calculations never import HTTP code.
The frontend and notebook use the same package; no second calculation implementation exists.

`requirements/runtime.txt` is the runtime dependency source read by `pyproject.toml`.
The `dev`, `notebook`, and `legacy` extras isolate optional tools and presentation dependencies.

Data defaults to the checkout's root `data/`, independent of the working directory.
Set `GADDED_DATA_DIR` explicitly for installed/container deployments. Generated files
use `GADDED_ARTIFACT_DIR` (default `artifacts/`). Pure calculations receive their inputs
directly; settings are used only at I/O boundaries.

Tests are split into `tests/unit/` and `tests/integration/`. Provider tests skip without
keys. Keep keys unset for offline validation.
