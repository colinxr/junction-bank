#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

cleanup() {
  echo "\nCleaning up E2E Postgres..."
  bash "$SCRIPT_DIR/e2e-down.sh" || true
}
trap cleanup EXIT

echo "Booting isolated E2E Postgres..."
bash "$SCRIPT_DIR/e2e-up.sh"

echo "Applying migrations to E2E database..."
dotenv -e .env.e2e -- prisma migrate deploy

echo "Running Playwright tests..."
dotenv -e .env.e2e -- playwright test


