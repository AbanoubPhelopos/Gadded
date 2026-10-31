"""FastAPI composition root. Run with ``uvicorn gadded.main:app``."""
from fastapi import FastAPI

from gadded.api.routes import assessments, health


def create_app() -> FastAPI:
    """Compose HTTP routers without initializing models or calling AI providers."""
    application = FastAPI(title="Gadded Assessment API", version="0.2.0")
    application.include_router(health.router, prefix="/api")
    application.include_router(assessments.router, prefix="/api")
    return application


app = create_app()
