# Retired Streamlit interface

The primary interface is `frontend/`, backed by `gadded.main:app`.
This directory preserves the previous demo for reference.
Historical UI captures are preserved in `screenshots/`.

From the repository root, install the current package's optional legacy dependencies:

```bash
python -m pip install -e './backend[legacy]'
streamlit run legacy/streamlit/app.py
```

The `requirements*.txt` files are historical snapshots of the pre-refactor environment,
not the dependency source for the active application. Do not use them for a new install.
