# Application architecture

Gadded has one analytical engine with two callers: the React demo over HTTP and the
root showcase notebook. The package lives in `backend/src/gadded/`.

```text
React pages -> frontend/lib/api -> Nginx /api proxy
                                   |
                            gadded.main:create_app
                                   |
                              api/routes
                                   |
                       application/assessment.py
                         /       |          \
                   energy/   economics/   siting/ + regulatory/
                         \       |          /
                         canonical contracts.py
                                   |
                         reporting/report.py
```

`application/resources.py` owns cached reference-data/model loading. `integrations/`
owns weather/provider adapters; `discovery/` owns evidence-gated search workflows.
The notebook imports the same analytical modules directly to explain each stage.

## Dependency rules

1. HTTP schemas wrap canonical Pydantic models; route handlers delegate calculations.
2. Calculation modules never import FastAPI, React concerns, or API routes.
3. Domain modules exchange canonical contracts, series, or explicit calculation inputs.
4. Filesystem configuration lives in `core/config.py`; nested modules do not count
   parent directories to locate data.
5. Generated reports/model bundles belong in `artifacts/`, not `data/` or `src/`.
6. Optional AI calls stay on the server and never set the deterministic status.

## Import migration guide

| Former module | Current module |
| --- | --- |
| `gadded.api:app` | `gadded.main:app` |
| `gadded.pipeline` | `gadded.application.assessment` |
| `gadded.load`, `gadded.load_ml` | `gadded.energy.load`, `gadded.energy.load_ml` |
| `gadded.pv`, `gadded.matching`, `gadded.optimization` | Corresponding modules under `gadded.energy` |
| `gadded.finance`, `gadded.risk` | Corresponding modules under `gadded.economics` |
| `gadded.gis` | `gadded.siting.gis` |
| `gadded.regulatory` | `gadded.regulatory.engine` |
| `gadded.vendors`, `gadded.financing` | Corresponding modules under `gadded.discovery` |
| `gadded.weather`, `gadded._llm` | `gadded.integrations.weather`, `gadded.integrations.llm` |
| `gadded.feasibility` | `gadded.application.feasibility` |
| `gadded.report` | `gadded.reporting.report` |
| `gadded.contracts` | Unchanged |

The refactor intentionally updates all internal callers instead of retaining a second
flat API. No saved model bundles are committed; older external pickles referencing
the previous module paths should be retrained, not loaded blindly.

## Runtime and verification

`compose.yaml` builds `backend/Dockerfile` from the root context to include shared data.
The production image installs the Python package and runs as an unprivileged user.
The test image adds testing/notebook tools. Data paths are explicit in Docker.

API paths and JSON shapes remain stable. Frontend routes, English/Arabic locales,
feasibility decisions, citations, and financial formulas are preserved.
Tests cover numerical behavior, HTTP integration, data-path configuration, and offline
notebook execution. React rendering checks exercise both locales against the running API.
