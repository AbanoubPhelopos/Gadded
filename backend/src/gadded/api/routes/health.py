"""Application availability and non-secret capability metadata."""
import os

from fastapi import APIRouter

from gadded.core.constants import COVERAGE_NOTICE

router = APIRouter(tags=["system"])


@router.get("/health")
def health() -> dict:
    """Confirm API availability without contacting external services."""
    return {"status": "ok", "version": "0.2.0"}


@router.get("/metadata")
def metadata() -> dict:
    """Expose provider availability and coverage without exposing credentials."""
    return {
        "coverageNotice": COVERAGE_NOTICE,
        "regulatoryAiAvailable": bool(os.getenv("GEMINI_API_KEY")),
        "discoveryAvailable": bool(os.getenv("GEMINI_API_KEY") and os.getenv("GROQ_API_KEY")),
    }
