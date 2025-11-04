#!/usr/bin/env bash
set -euo pipefail

echo "ENTRYPOINT: env vars:"
echo "  DB_HOST=${DB_HOST:-postgres}"
echo "  DB_PORT=${DB_PORT:-5432}"
echo "  DB_USER=${DB_USER:-hydra_user}"
echo "  DB_NAME=${DB_NAME:-hydra_db}"

cd /app

echo "Waiting for Postgres (using python)..."
if ! python3 wait_for_db.py; then
  echo "ERROR: DB not available after retries - exiting"
  exit 1
fi

echo "Running alembic upgrade head..."
alembic -c alembic.ini upgrade head || { echo "Alembic failed"; exit 1; }

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000