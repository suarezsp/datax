#!/usr/bin/env bash
set -euo pipefail

echo "=== Loading Alembic ==="

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# agregar backend al PYTHONPATH
export PYTHONPATH="$ROOT/backend:${PYTHONPATH:-}"

# Cargar variables de .env si existen
if [ -f "$ROOT/.env" ]; then
  # shellcheck disable=SC1090
  export $(grep -v '^#' "$ROOT/.env" | xargs)
fi

echo "Waiting for Postgres to be ready at ${DB_HOST}:${DB_PORT}..."
for i in {1..30}; do
  if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" >/dev/null 2>&1; then
    echo "Postgres is ready"
    break
  fi
  echo "Postgres not ready yet... ($i/30)"
  sleep 1
done

alembic -c backend/alembic.ini upgrade head
echo "Alembic migration completed successfully."