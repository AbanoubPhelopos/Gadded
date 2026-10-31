"""Transport-specific request shapes composed from canonical domain contracts."""
from pydantic import BaseModel

from gadded.contracts import AssessmentInput


class AssessmentRequest(BaseModel):
    """Canonical input and an explicit opt-in to configured AI providers."""

    assessment: AssessmentInput
    runLlm: bool = False
