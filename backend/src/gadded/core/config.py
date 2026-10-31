"""Filesystem configuration shared by the API, analytical modules, and tests."""
from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    """Runtime paths; provider credentials are never part of this public object."""

    data_dir: Path
    artifact_dir: Path


def repository_root() -> Path:
    """Locate the checkout independently of the process working directory."""
    for parent in Path(__file__).resolve().parents:
        if (parent / "compose.yaml").is_file() and (parent / "data").is_dir():
            return parent
    return Path.cwd()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Resolve overridable paths once; installed deployments should set GADDED_DATA_DIR."""
    root = repository_root()
    return Settings(
        data_dir=Path(os.getenv("GADDED_DATA_DIR", str(root / "data"))).expanduser().resolve(),
        artifact_dir=Path(os.getenv("GADDED_ARTIFACT_DIR", str(root / "artifacts"))).expanduser().resolve(),
    )
