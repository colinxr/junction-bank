# Docker Quick Reference

Essential commands for daily development.

## Environment Control

```bash
# Development
just dev                  # Start
just dev-stop            # Stop
just dev-restart         # Restart
just dev-logs            # View logs
just dev-logs php        # View specific service

# Production
just prod                # Start
just prod-stop           # Stop
just prod-logs           # View logs

# Testing
just test                # Run all tests
just test-phpunit        # PHPUnit
just test-pest           # Pest
just test-phpstan        # Static analysis
just test-cs             # Code style check
just test-cs-fix         # Fix code style
```

## Application Commands

```bash
# Artisan
just artisan migrate
just artisan make:controller UserController
just artisan route:list
just artisan queue:work

# Composer
just composer install
just composer require vendor/package
just composer dump-autoload

# Shell access
just ssh                 # SSH into PHP container
```

## Database Operations

```bash
# Migrations
just migrate             # Run migrations
just migrate-rollback    # Rollback last migration
just migrate-fresh       # Fresh database with seed
just seed                # Run seeders

# Access
just psql                # PostgreSQL CLI
just redis-cli           # Redis CLI

# Backup & Restore
just db-backup           # Create backup
just db-restore          # Restore from latest backup
```

## Health & Monitoring

```bash
just health              # Check service health
docker stats             # Resource usage
docker compose ps        # Service status
```

## Cleanup

```bash
just clean-cache         # Clear Laravel caches
just clean               # Remove containers & volumes
just clean-docker        # Prune entire Docker system
```

## Service URLs

### Development

- **App**: http://localhost:8000
- **MailHog**: http://localhost:8025
- **PgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081

### Debugging

- **Xdebug**: Port 9003

## Docker Compose Commands

When you need manual control:

```bash
# Development
docker compose -f compose.yml -f compose.dev.yml up -d
docker compose -f compose.yml -f compose.dev.yml down
docker compose -f compose.yml -f compose.dev.yml logs -f
docker compose -f compose.yml -f compose.dev.yml exec php sh

# Production
docker compose -f compose.yml -f compose.prod.yml up -d
docker compose -f compose.yml -f compose.prod.yml down

# Testing
docker compose -f compose.yml -f compose.test.yml up --abort-on-container-exit
docker compose -f compose.yml -f compose.test.yml down -v
```

## Common Workflows

### New Feature Branch

```bash
just dev
just migrate
just artisan make:controller FeatureController
just test
```

### Fix Failing Tests

```bash
just test                # Run tests
just dev-logs php        # Check logs
just ssh                 # Debug in container
just test                # Re-run tests
```

### Database Reset

```bash
just migrate-fresh       # Drop all tables, recreate, seed
# or
just artisan migrate:fresh --seed
```

### Performance Issues

```bash
docker stats             # Check resource usage
just clean-cache         # Clear caches
just dev-restart         # Restart services
```

### Update Dependencies

```bash
just composer update
just dev-restart         # Restart to reload code
just test                # Verify tests pass
```

## Troubleshooting

### Container won't start

```bash
just dev-logs [service]  # Check logs
just clean               # Nuclear option
just build-dev           # Rebuild images
just dev                 # Start again
```

### Permission errors

```bash
# Add to .env
echo "USER_ID=$(id -u)" >> .env
echo "GROUP_ID=$(id -g)" >> .env
just build-dev
just dev
```

### Port conflicts

```bash
# Edit .env
APP_PORT=8080
DB_PORT=5433
REDIS_PORT=6380

just dev-restart
```

### Database connection failed

```bash
just dev-logs postgres   # Check PostgreSQL logs
just psql                # Test connection
just ssh                 # Debug from PHP container
>>> php artisan tinker
>>> DB::connection()->getPdo();
```

## File Locations

```
docker/
├── php/
│   ├── Dockerfile.dev       # Dev image
│   ├── Dockerfile.prod      # Prod image
│   ├── php-dev.ini          # PHP config (dev)
│   └── php-prod.ini         # PHP config (prod)
├── caddy/
│   └── Caddyfile            # Web server config
├── postgres/
│   ├── init-scripts/
│   │   └── 01-init.sql      # DB initialization
│   └── backups/             # Database backups
├── redis/
│   └── redis.conf           # Redis config
└── README.md                # Full documentation

compose.yml              # Base configuration
compose.dev.yml          # Development overrides
compose.prod.yml         # Production overrides
compose.test.yml         # Testing overrides
justfile                 # Command shortcuts
.env                     # Environment variables
```

## Environment Variables

Key variables in `.env`:

```bash
# Application
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_PORT=8000

# Database
DB_DATABASE=junction_bank
DB_USERNAME=junction_user
DB_PASSWORD=secret

# Debugging
XDEBUG_MODE=debug

# User IDs (macOS/Linux)
USER_ID=$(id -u)
GROUP_ID=$(id -g)
```

## Service Configuration

### PHP Container

- **Image**: PHP 8.3 FPM Alpine
- **Extensions**: PostgreSQL, Redis, GD, Intl, OPcache
- **User**: laravel (UID 1000)
- **Xdebug**: Port 9003

### PostgreSQL

- **Version**: 16 Alpine
- **Port**: 5432
- **Database**: junction_bank
- **User**: junction_user

### Redis

- **Version**: 7 Alpine
- **Port**: 6379
- **Persistence**: RDB + AOF

### Caddy

- **Version**: 2 Alpine
- **Ports**: 80, 443
- **Features**: HTTP/2, HTTP/3

## Health Checks

All services include health checks:

```bash
# Check status
docker compose ps

# Manual health check
docker compose exec php php-fpm -t
docker compose exec postgres pg_isready
docker compose exec redis redis-cli ping
```

## Best Practices

1. **Always use `just` commands** - Abstracts Docker complexity
2. **Check logs first** - Most issues visible in logs
3. **Keep `.env` updated** - Set USER_ID and GROUP_ID
4. **Regular cleanup** - Run `just clean-cache` weekly
5. **Test before commit** - Run `just test`
6. **Backup before experiments** - `just db-backup`

## Emergency Commands

```bash
# Everything is broken
just clean && just clean-docker && just setup

# Container is stuck
docker compose -f compose.yml -f compose.dev.yml kill [service]
docker compose -f compose.yml -f compose.dev.yml rm -f [service]
just dev

# Out of disk space
docker system prune -af --volumes

# Rebuild everything
just clean
just build-dev
just setup
```

## Performance Tips

### macOS

- Use `:cached` mount mode (already configured)
- Increase Docker Desktop RAM to 4-8GB
- Enable VirtioFS file sharing

### Linux

- Set correct USER_ID/GROUP_ID
- Use native Docker (not Desktop)
- Increase Docker daemon resources

## Getting Help

1. **Logs**: `just dev-logs`
2. **Health**: `just health`
3. **Documentation**: `docker/README.md`
4. **Architecture**: `docker/ARCHITECTURE.md`
5. **Getting Started**: `docker/GETTING_STARTED.md`
