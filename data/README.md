# Reference data

These are shared inputs for the Python package, API, and showcase notebook. Keep
source metadata beside each dataset; runtime outputs belong in `../artifacts/`.

| Path | Purpose |
| --- | --- |
| `golden_case.json` | Canonical 10th of Ramadan assessment input |
| `assumptions.json` | Versioned/classified technical and financial assumptions |
| `weather_10ramadan_cached.csv` | Cached hourly weather for the demo site |
| `weather_10ramadan_cached.meta.json` | Weather provenance and coverage metadata |
| `load_archetypes/archetypes.json` | Explicit synthetic industrial load archetypes |
| `regulations/excerpts.json` | Cited regulatory research excerpts/summaries |
| `regulations/rules.json` | Versioned deterministic rules |
| `zones.geojson` | GIS features with source and synthetic-demo labels |

Do not interpret missing geographic coverage as clearance. Do not describe synthetic
training profiles as measured factories. Preserve source/classification warnings in
every assessment. The environment variable `GADDED_DATA_DIR` can point to an explicit
copy of this directory for an installed deployment.
