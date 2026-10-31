"""Cached I/O resources used to assemble an assessment."""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

from gadded.contracts import AssumptionSet, load_assumptions
from gadded.core.config import get_settings
from gadded.energy.load_ml import LoadMlBundle, train_load_ml_model
from gadded.integrations.weather import WeatherDataset, load_cached_weather
from gadded.regulatory.engine import RegulatoryCorpus, load_excerpts, load_rules
from gadded.siting.gis import ZoneLayer, load_zones


@dataclass(frozen=True)
class AssessmentResources:
    """Named shared resources; consumers treat their contents as read-only."""

    assumptions: AssumptionSet
    weather: WeatherDataset
    load_model: LoadMlBundle
    zones: ZoneLayer
    regulatory_corpus: RegulatoryCorpus
    regulatory_rules: list[dict]


@lru_cache(maxsize=1)
def get_resources() -> AssessmentResources:
    """Read committed datasets and initialize the reproducible load model once."""
    data = get_settings().data_dir
    return AssessmentResources(
        assumptions=load_assumptions(data / "assumptions.json"),
        weather=load_cached_weather(data / "weather_10ramadan_cached.csv"),
        load_model=train_load_ml_model(seed=42, n_per_combo=40),
        zones=load_zones(data / "zones.geojson"),
        regulatory_corpus=load_excerpts(data / "regulations/excerpts.json"),
        regulatory_rules=load_rules(data / "regulations/rules.json"),
    )
