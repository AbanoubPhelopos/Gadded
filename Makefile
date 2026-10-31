.PHONY: up down logs install api frontend build test test-render notebook

up:
	docker compose up -d --build --wait

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

install:
	python -m pip install -e './backend[dev,notebook]'
	npm --prefix frontend ci

api:
	python -m uvicorn gadded.main:app --reload

frontend:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build

test:
	python -m pytest -c backend/pyproject.toml backend/tests

test-render:
	npm --prefix frontend run test:render

notebook:
	jupyter notebook gadded.ipynb
