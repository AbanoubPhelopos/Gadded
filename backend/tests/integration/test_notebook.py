"""Execute the graded notebook offline after module/path migrations."""
from pathlib import Path

import pytest

nbformat = pytest.importorskip("nbformat", reason="Notebook verification needs the notebook extra")
nbclient = pytest.importorskip("nbclient", reason="Notebook verification needs the notebook extra")
pytest.importorskip("matplotlib")
pytest.importorskip("dotenv")
pytest.importorskip("ipykernel")

from gadded.core.config import get_settings


def test_showcase_executes_offline(monkeypatch, tmp_path: Path) -> None:
    """Run unchanged source cells in a writable workspace without any provider keys."""
    backend = Path(__file__).resolve().parents[2]
    notebook_path = backend.parent / "gadded.ipynb"
    if not notebook_path.exists():
        pytest.skip("Showcase notebook is not included in this distribution")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setenv("GROQ_API_KEY", "")
    (tmp_path / "backend").symlink_to(backend, target_is_directory=True)
    (tmp_path / "data").symlink_to(get_settings().data_dir, target_is_directory=True)
    notebook = nbformat.read(notebook_path, as_version=4)
    executed = nbclient.NotebookClient(
        notebook, timeout=180, kernel_name="python3",
        resources={"metadata": {"path": str(tmp_path)}},
    ).execute()
    assert not [output for cell in executed.cells if cell.cell_type == "code"
                for output in cell.get("outputs", []) if output.output_type == "error"]
    report = tmp_path / "artifacts/reports/example_report.html"
    assert report.is_file()
    assert "feasible_with_conditions" in report.read_text(encoding="utf-8")
