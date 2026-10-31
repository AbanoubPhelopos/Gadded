"""Configuration paths must work independently of shell working directories."""
from pathlib import Path

from gadded.core.config import get_settings


def test_explicit_paths_survive_working_directory_change(monkeypatch, tmp_path: Path) -> None:
    data = tmp_path / "reference-data"
    artifacts = tmp_path / "generated"
    monkeypatch.setenv("GADDED_DATA_DIR", str(data))
    monkeypatch.setenv("GADDED_ARTIFACT_DIR", str(artifacts))
    monkeypatch.chdir(tmp_path)
    get_settings.cache_clear()
    try:
        settings = get_settings()
        assert settings.data_dir == data
        assert settings.artifact_dir == artifacts
        assert settings is get_settings()
        assert not artifacts.exists()  # Reading settings does not write files.
    finally:
        get_settings.cache_clear()
