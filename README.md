# Gadded · Solar intelligence for Egyptian industry

Gadded turns factory electricity consumption and rooftop information into a preliminary
solar assessment: technical sizing, financial uncertainty, site screening, and a cited
regulatory roadmap. The React application and showcase notebook share one Python engine.

Built for **AI Empower Egypt 2026 · Renewable Energy Using AI**. The graded artifacts
remain the Python package, `gadded.ipynb`, and `docs/gadded.pdf`.

## Run with Docker Desktop

```bash
docker compose up -d --build --wait
```

Open **http://localhost:8080**. The committed golden-case assessment runs automatically.
Use **Edit inputs** to configure a site, factory consumption, and financing scenario.
Choose **English (UK)** or **Arabic (Egypt)** in the header; Arabic uses RTL layout.
Source evidence and the downloadable HTML report retain their original English language.

**AI providers are optional and currently unconfigured.** Core calculations and cited
rules work without keys. Add a root `.env` using `.env.example` later, then recreate
the API container to enable optional live explanation and vendor/financing discovery.
No provider calls occur in the default assessment.

```bash
docker compose ps
docker compose logs --tail=100 api
docker compose down
```

Set `GADDED_PORT` to change the default port 8080. The API is internal to the Compose
network; Nginx serves the frontend and proxies `/api`.

## Repository map

```text
Gadded/
├── backend/
│   ├── pyproject.toml           # Python package, optional extras, pytest configuration
│   ├── requirements/runtime.txt # runtime dependency source for the package
│   ├── Dockerfile               # runtime, test, and production stages
│   ├── src/gadded/
│   │   ├── main.py              # FastAPI application factory and server entry point
│   │   ├── contracts.py         # canonical Pydantic domain models
│   │   ├── api/                 # HTTP routes and request schemas
│   │   ├── application/         # assessment use case, resources, feasibility
│   │   ├── core/                # configuration and shared disclosures
│   │   ├── energy/              # load ML, PV, hourly matching, sizing
│   │   ├── economics/           # finance and Monte Carlo risk
│   │   ├── siting/              # GIS screening
│   │   ├── regulatory/          # retrieval, cited rules, optional explanation
│   │   ├── discovery/           # evidence-gated vendors and financing
│   │   ├── integrations/        # weather I/O and provider adapters
│   │   └── reporting/           # result assembly and HTML rendering
│   └── tests/
│       ├── unit/                # formulas, rules, models, configuration
│       └── integration/         # API, report, and offline notebook execution
├── frontend/                    # React + TypeScript + Tailwind + Vite
│   └── src/
│       ├── pages/               # lazy-loaded analytical views
│       ├── components/          # layout, shared UI, charts, assessment controls
│       ├── state/               # assessment state and locale preference
│       ├── lib/                 # HTTP, formatting, translations
│       └── data/                # API-facing TypeScript shapes
├── data/                        # versioned reference inputs and source metadata
├── docs/                        # graded PDF and current architecture documentation
├── context/                     # product decisions, contracts, standards, progress
├── artifacts/                   # generated reports/models; ignored by Git
├── legacy/streamlit/            # retired UI and historical dependency snapshots
├── gadded.ipynb                 # graded end-to-end showcase
├── compose.yaml                 # local application stack
└── Makefile                     # common development commands
```

See [backend responsibilities](backend/README.md), [architecture](docs/architecture.md),
[data inventory](data/README.md), and [current progress](context/progress-tracker.md).

## Local development

Requires **Python 3.12+** and **Node 22.12+**. From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e './backend[dev,notebook]'
npm --prefix frontend ci
```

Run in separate terminals:

```bash
make api       # FastAPI on port 8000
make frontend  # Vite; proxies /api to localhost:8000
```

`backend/requirements/runtime.txt` defines runtime dependencies. Optional extras in
`backend/pyproject.toml` isolate `dev`, `notebook`, and `legacy` tools. Do not install
historical dependency snapshots from `legacy/` for the active application.

### Showcase notebook

```bash
make notebook
```

Launch from the repository root and run the cells top-to-bottom. Imports point to the
organized backend package; report output goes to `artifacts/reports/`. Provider cells
skip without keys. Reference data remains under `data/`.

## Validation

```bash
make build        # strict TypeScript check and production frontend build
make test         # backend unit + integration tests; provider tests skip without keys
make test-render  # bilingual React rendering checks against running Compose
```

For isolated container tests, including the offline showcase notebook:

```bash
docker build -f backend/Dockerfile --target test -t gadded-tests .
docker run --rm gadded-tests
```

Keep provider keys unset for offline checks. Notebook execution tests use a temporary
workspace and never overwrite the committed notebook or its outputs. React render tests
check markup and locale formatting; browser visual/interaction QA is a separate check.

## Analytical boundaries

| Stage | Method |
| --- | --- |
| Factory load | ML clustering/classification over explicitly synthetic archetypes |
| Solar generation | pvlib physics with cached NASA POWER weather |
| Capacity sizing | Constrained NPV optimization |
| Finance and uncertainty | Deterministic formulas and seeded Monte Carlo ranges |
| Site screening | Shapely against source-labelled local GIS layers |
| Regulatory status | Versioned deterministic rules with citations |
| Optional explanation/discovery | Gemini explanation/extraction and Groq web search |

The LLM never decides feasibility. Missing authoritative coverage is `unknown`.
Every displayed vendor requires source evidence. Reports render computed results;
they do not recalculate them. Finance shows P10/P50/P90 outcomes rather than a single
promised return.

## Configuration and limits

- `GADDED_DATA_DIR`: absolute reference-data directory. Defaults to the checkout's
  `data/`, resolved independently of the working directory. Set it explicitly for a
  wheel installation outside the checkout. Docker sets `/app/data`.
- `GADDED_ARTIFACT_DIR`: generated-file destination (checkout default: `artifacts/`).
- `.env`: optional provider keys; never committed or shipped in an image.
- Cached weather is limited to the 10th of Ramadan demo area (within 0.1 degrees of
  the golden site). No nationwide weather or authoritative GIS coverage is implied.
- GIS includes a labelled synthetic protected-area scenario. Load-model training is
  synthetic; regulatory excerpts include paraphrased research summaries.
- Results are held in browser memory and reset on reload. No database, auth, or queue.
- Reports are available as self-contained HTML and JSON; browser print can save PDF.

This is preliminary decision support. Confirm structural safety, grid capacity,
regulatory requirements, installer capabilities, and financing terms with qualified
professionals and the responsible authorities before investing.
