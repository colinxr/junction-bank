#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME=${E2E_PG_CONTAINER:-junction-bank-e2e-pg}
PORT=${E2E_PG_PORT:-5433}
DB_NAME=${E2E_PG_DB:-junction_bank_e2e}
DB_USER=${E2E_PG_USER:-postgres}
DB_PASSWORD=${E2E_PG_PASSWORD:-postgres}

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container ${CONTAINER_NAME} already exists. Stopping and removing..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi

echo "Starting ephemeral Postgres container ${CONTAINER_NAME} on port ${PORT}..."
docker run --rm -d \
  --name "${CONTAINER_NAME}" \
  -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
  -e POSTGRES_USER="${DB_USER}" \
  -e POSTGRES_DB="${DB_NAME}" \
  -p "${PORT}:5432" \
  postgres:16-alpine >/dev/null

echo "Waiting for Postgres to be ready..."
until docker exec "${CONTAINER_NAME}" pg_isready -U "${DB_USER}" >/dev/null 2>&1; do
  sleep 0.5
done

echo "Postgres is ready at postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${PORT}/${DB_NAME}"

