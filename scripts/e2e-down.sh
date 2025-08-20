#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME=${E2E_PG_CONTAINER:-junction-bank-e2e-pg}

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Stopping ${CONTAINER_NAME}..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
else
  echo "No container ${CONTAINER_NAME} running."
fi

