.PHONY: up infra up-detach build down logs migrate load-sample test

up:
	docker compose -f infra/docker-compose.yml up --build

up-detach:
	docker compose -f infra/docker-compose.yml up --build -d

down:
	docker compose -f infra/docker-compose.yml down -v

logs:
	docker compose -f infra/docker-compose.yml logs -f

migrate:
	@echo "Running migrations..."
	cd backend && alembic -c alembic.ini upgrade head

load-sample:
	python backend/scripts/load_sample_data.py

test:
	pytest -q