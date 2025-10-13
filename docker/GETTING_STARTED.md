# Getting Started with Junction Bank

Quick start guide for developers new to the project.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.x+
- Just command runner (`brew install just` or `cargo install just`)
- Git

## Initial Setup

### 1. Clone and Configure

```bash
# Navigate to project
cd junction-bank

# Copy environment file (if it doesn't exist)
# Configure the variables as needed
cp .env.example .env

# Set your user ID for correct file permissions
echo "USER_ID=$(id -u)" >> .env
echo "GROUP_ID=$(id -g)" >> .env
```

### 2. Start Environment

```bash
# Run initial setup (builds images, starts services, runs migrations)
just setup

# Or manually:
just build-dev
just dev
just composer install
just artisan key:generate
just migrate-fresh
```

### 3. Access Services

Once running, access:

- **Application**: http://localhost:8000
- **MailHog** (Email testing): http://localhost:8025
- **PgAdmin** (Database UI): http://localhost:5050
- **Redis Commander**: http://localhost:8081

## Daily Workflow

### Starting Work

```bash
# Start all services
just dev

# Check everything is healthy
just health
```

### Common Tasks

```bash
# Run migrations
just migrate

# Seed database
just seed

# Run Artisan commands
just artisan route:list
just artisan make:controller UserController

# Install Composer packages
just composer require vendor/package

# View logs
just dev-logs
just dev-logs php  # specific service
```

### Running Tests

```bash
# Run all tests
just test

# Run specific test suites
just test-phpunit
just test-pest
just test-phpstan
just test-cs

# Fix code style issues
just test-cs-fix
```

### Database Operations

```bash
# Access PostgreSQL CLI
just psql

# Backup database
just db-backup

# Restore from backup
just db-restore

# Fresh migrations with seed
just migrate-fresh
```

### Debugging

```bash
# SSH into PHP container
just ssh

# View real-time logs
just dev-logs

# Clear Laravel caches
just clean-cache

# Access Redis CLI
just redis-cli
```

### Stopping Work

```bash
# Stop all services (preserves data)
just dev-stop

# Remove everything including volumes
just clean
```

## Project Structure

```
junction-bank/
├── app/                    # Laravel application (to be created)
│   ├── Domain/            # DDD Domain layer
│   ├── Application/       # DDD Application layer
│   ├── Infrastructure/    # DDD Infrastructure layer
│   └── Presentation/      # DDD Presentation layer
├── docker/                # Docker configuration
│   ├── php/              # PHP Dockerfiles and config
│   ├── caddy/            # Caddy web server config
│   ├── postgres/         # PostgreSQL config and backups
│   └── redis/            # Redis configuration
├── compose.yml           # Base Docker Compose
├── compose.dev.yml       # Development overrides
├── compose.prod.yml      # Production overrides
├── compose.test.yml      # Testing overrides
├── justfile              # Command shortcuts
└── PRDs/                 # Product Requirements Documents
```

## Environment Variables

Key variables in `.env`:

```bash
# Application
APP_ENV=local              # Environment: local, staging, production
APP_DEBUG=true             # Enable debug mode
APP_URL=http://localhost:8000

# Database
DB_DATABASE=junction_bank
DB_USERNAME=junction_user
DB_PASSWORD=secret

# Ports (customize if needed)
APP_PORT=8000             # Main application port
DB_PORT=5432              # PostgreSQL port
REDIS_PORT=6379           # Redis port

# Development Tools
XDEBUG_MODE=debug         # Xdebug mode: debug, coverage, develop
```

## Xdebug Configuration

### VSCode

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}/app"
      }
    }
  ]
}
```

### PHPStorm

1. Settings → PHP → Servers
2. Create server named `junction-bank`
3. Host: `localhost`, Port: `8000`
4. Path mappings: `./app` → `/var/www/html`
5. Start listening for debug connections

## Troubleshooting

### Port Already in Use

```bash
# Change ports in .env
APP_PORT=8080
DB_PORT=5433
REDIS_PORT=6380

# Restart
just dev-restart
```

### Permission Errors

```bash
# Ensure USER_ID and GROUP_ID are set correctly
echo "USER_ID=$(id -u)" >> .env
echo "GROUP_ID=$(id -g)" >> .env

# Rebuild containers
just build-dev
just dev
```

### Database Connection Failed

```bash
# Check PostgreSQL is running and healthy
docker compose -f compose.yml -f compose.dev.yml ps postgres

# Check logs
just dev-logs postgres

# Verify from PHP container
just ssh
php artisan tinker
>>> DB::connection()->getPdo();
```

### Container Won't Start

```bash
# View all logs
just dev-logs

# Check specific service
docker compose -f compose.yml -f compose.dev.yml logs php

# Rebuild from scratch
just clean
just build-dev
just dev
```

### Clear Everything

```bash
# Nuclear option - removes everything
just clean
just clean-docker

# Start fresh
just setup
```

## Performance Tips

### macOS Users

Docker on macOS can be slow with mounted volumes. The configuration uses `:cached` mount mode for better performance, but consider:

1. Increase Docker Desktop resources (CPU, RAM)
2. Use Docker Desktop with VirtioFS
3. Store project on Docker Desktop's VM (not NFS)

### Linux Users

Performance should be native. Ensure:

- User IDs match (set in .env)
- Docker daemon has sufficient resources

## Next Steps

1. **Read PRDs**: Check `/PRDs` directory for requirements
2. **Review Domain Structure**: Understand DDD architecture
3. **Run Tests**: `just test` to ensure everything works
4. **Start Development**: Create features following DDD patterns
5. **Documentation**: Keep docs updated as you build

## Getting Help

1. Check service logs: `just dev-logs [service]`
2. Review Docker documentation: `docker/README.md`
3. Verify health: `just health`
4. Check Laravel logs: `app/storage/logs/laravel.log`

## Production Notes

Never use development configuration in production:

- `compose.dev.yml` includes debugging tools
- Database ports are exposed
- Passwords are weak defaults
- Security features are relaxed

For production, use `compose.prod.yml` with proper secrets management.
