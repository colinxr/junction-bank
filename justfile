# Junction Bank - Justfile
# Run commands with: just <command>

# Default recipe - show available commands
default:
    @just --list

# Development Commands
# ====================

# Start development environment
dev:
    docker compose -f compose.yml -f compose.dev.yml up -d
    @echo "Development environment started!"
    @echo "App: http://localhost:8000"
    @echo "Adminer: http://localhost:8080"
    @echo "Redis Commander: http://localhost:8081"
    @echo "MailHog: http://localhost:8025"
    @echo "Vite Dev Server: http://localhost:5173"

# Stop development environment
dev-stop:
    docker compose -f compose.yml -f compose.dev.yml down

# Restart development environment
dev-restart:
    docker compose -f compose.yml -f compose.dev.yml restart

# View development logs
dev-logs service="":
    @if [ -z "{{service}}" ]; then \
        docker compose -f compose.yml -f compose.dev.yml logs -f; \
    else \
        docker compose -f compose.yml -f compose.dev.yml logs -f {{service}}; \
    fi

# Production Commands
# ===================

# Start production environment
prod:
    docker compose -f compose.yml -f compose.prod.yml up -d
    @echo "Production environment started!"

# Stop production environment
prod-stop:
    docker compose -f compose.yml -f compose.prod.yml down

# View production logs
prod-logs service="":
    @if [ -z "{{service}}" ]; then \
        docker compose -f compose.yml -f compose.prod.yml logs -f; \
    else \
        docker compose -f compose.yml -f compose.prod.yml logs -f {{service}}; \
    fi

# Testing Commands
# ================

# Run all tests
test:
    docker compose -f compose.yml -f compose.test.yml up --abort-on-container-exit
    docker compose -f compose.yml -f compose.test.yml down -v

# Run Pest tests
test-pest:
    docker compose -f compose.yml -f compose.test.yml --profile pest up --abort-on-container-exit
    docker compose -f compose.yml -f compose.test.yml down -v

# Run static analysis (PHPStan)
phpstan:
    docker compose -f compose.yml -f compose.dev.yml exec php ./vendor/bin/phpstan analyse

# Run static analysis with verbose output
phpstan-verbose:
    docker compose -f compose.yml -f compose.dev.yml exec php ./vendor/bin/phpstan analyse --verbose

# Check code style with Pint
pint:
    docker compose -f compose.yml -f compose.dev.yml exec php ./vendor/bin/pint

# Check code style without fixing
pint-test:
    docker compose -f compose.yml -f compose.dev.yml exec php ./vendor/bin/pint --test

# Run architecture tests
test-arch:
    docker compose -f compose.yml -f compose.test.yml --profile architecture up --abort-on-container-exit
    docker compose -f compose.yml -f compose.test.yml down -v

# Run all quality checks
test-all: test test-phpstan test-cs test-arch

# Application Commands
# ====================

# Execute artisan command
artisan *args:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan {{args}}

# Execute composer command
composer *args:
    docker compose -f compose.yml -f compose.dev.yml exec php composer {{args}}

# SSH into PHP container
ssh:
    docker compose -f compose.yml -f compose.dev.yml exec php sh

# Database Commands
# =================

# Run migrations
migrate:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan migrate

# Rollback migrations
migrate-rollback:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan migrate:rollback

# Refresh database with seed
migrate-fresh:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan migrate:fresh --seed

# Run database seeders
seed:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan db:seed

# Backup database
db-backup:
    @mkdir -p docker/postgres/backups
    docker compose -f compose.yml -f compose.dev.yml exec -T postgres pg_dump -U junction_user -Fc junction_bank > docker/postgres/backups/backup_$(date +%Y%m%d_%H%M%S).dump
    @echo "Database backed up to docker/postgres/backups/"

# Restore database from latest backup
db-restore:
    @LATEST_BACKUP=$$(ls -t docker/postgres/backups/*.dump | head -1); \
    if [ -z "$$LATEST_BACKUP" ]; then \
        echo "No backup files found!"; \
        exit 1; \
    fi; \
    echo "Restoring from: $$LATEST_BACKUP"; \
    docker compose -f compose.yml -f compose.dev.yml exec -T postgres pg_restore -U junction_user -d junction_bank --clean < $$LATEST_BACKUP

# Access PostgreSQL CLI
psql:
    docker compose -f compose.yml -f compose.dev.yml exec postgres psql -U junction_user -d junction_bank

# Access Redis CLI
redis-cli:
    docker compose -f compose.yml -f compose.dev.yml exec redis redis-cli

# Asset Compilation Commands
# ===========================

# Build assets for production
assets-build:
    docker compose -f compose.yml -f compose.dev.yml exec node npm run build

# Install npm dependencies
npm-install:
    docker compose -f compose.yml -f compose.dev.yml exec node npm install

# Update npm dependencies
npm-update:
    docker compose -f compose.yml -f compose.dev.yml exec node npm update

# View Node/Vite logs
vite-logs:
    docker compose -f compose.yml -f compose.dev.yml logs -f node

# Code Quality Commands
# ======================

# Run all quality checks
quality: phpstan pint-test
    @echo "All quality checks passed!"

# Fix all code style issues
fix: pint
    @echo "Code style fixed!"

# Build Commands
# ==============

# Build development images
build-dev:
    docker compose -f compose.yml -f compose.dev.yml build --no-cache

# Build production images
build-prod:
    docker compose -f compose.yml -f compose.prod.yml build --no-cache

# Build all images
build-all: build-dev build-prod

# Cleanup Commands
# ================

# Remove all containers and volumes
clean:
    docker compose -f compose.yml -f compose.dev.yml down -v
    docker compose -f compose.yml -f compose.prod.yml down -v
    docker compose -f compose.yml -f compose.test.yml down -v

# Clean Laravel caches
clean-cache:
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan cache:clear
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan config:clear
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan route:clear
    docker compose -f compose.yml -f compose.dev.yml exec php php artisan view:clear

# Prune Docker system
clean-docker:
    docker system prune -af --volumes

# Setup Commands
# ==============

# Initial setup for new developers
setup:
    @echo "Setting up Junction Bank..."
    cp .env.example .env
    just build-dev
    just dev
    sleep 10
    just composer install
    just artisan key:generate
    just migrate-fresh
    @echo "Setup complete! Visit http://localhost:8000"

# Install dependencies
install:
    just composer install
    just artisan key:generate

# Health check
health:
    @echo "Checking service health..."
    docker compose -f compose.yml -f compose.dev.yml ps

