"""Thin HTTP routes for assessment intake and execution."""
import json
import logging

from fastapi import APIRouter, HTTPException

from gadded.api.schemas import AssessmentRequest
from gadded.application.assessment import run_assessment
from gadded.core.config import get_settings

router = APIRouter(tags=["assessments"])
logger = logging.getLogger(__name__)


@router.get("/defaults")
def defaults() -> dict:
    """Return the committed golden input using the configured data directory."""
    return json.loads((get_settings().data_dir / "golden_case.json").read_text(encoding="utf-8"))


@router.post("/assessments")
def assess(request: AssessmentRequest) -> dict:
    """Validate supported demo scope and delegate to application orchestration."""
    ai = request.assessment
    if abs(ai.location.latitude - 30.3203) > 0.1 or abs(ai.location.longitude - 31.7466) > 0.1:
        raise HTTPException(422, "This demo uses cached weather for 10th of Ramadan City. Choose a nearby site (within 0.1°).")
    if not ai.projectName.strip() or len(ai.projectName) > 200:
        raise HTTPException(422, "Project name must contain 1–200 characters.")
    if ai.site.availableRoofAreaM2 > 30000:
        raise HTTPException(422, "Demo roof area is limited to 30,000 m².")
    try:
        return run_assessment(ai, request.runLlm)
    except Exception as exc:
        logger.exception("Assessment failed")
        raise HTTPException(500, "Assessment could not be completed. Your inputs are preserved; retry or check the API logs.") from exc
