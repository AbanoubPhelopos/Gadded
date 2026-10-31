FROM python:3.12-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 GADDED_DATA_DIR=/app/data GADDED_ARTIFACT_DIR=/home/gadded/artifacts
COPY backend/requirements/runtime.txt ./requirements-runtime.txt
RUN pip install --no-cache-dir -r requirements-runtime.txt
COPY backend/pyproject.toml ./backend/pyproject.toml
COPY backend/requirements ./backend/requirements
COPY backend/src ./backend/src
RUN pip install --no-cache-dir --no-deps ./backend
COPY data ./data
RUN useradd --create-home gadded
USER gadded
EXPOSE 8000
CMD ["uvicorn", "gadded.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM runtime AS test
USER root
RUN pip install --no-cache-dir pytest httpx matplotlib python-dotenv nbclient ipykernel
COPY backend/tests ./backend/tests
COPY gadded.ipynb ./gadded.ipynb
WORKDIR /app/backend
USER gadded
CMD ["pytest", "-q", "-p", "no:cacheprovider", "-m", "not live"]

FROM runtime AS production
