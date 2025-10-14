# Troubleshooting Guide

## Docker Issues

### Container Won't Start

**Symptom:** Container exits immediately or won't start

**Solution:**

```bash
# Check logs for specific error
just dev-logs

# Check specific service
just dev-logs php

# Verify health status
docker compose -f compose.yml -f compose.dev.yml ps

# Check resource usage
docker stats
```

**Common Causes:**

-   Port already in use
-   Insufficient memory
-   Configuration error
-   Missing environment variables

### Port Already in Use

**Symptom:** Error: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution:**

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in compose.yml
# ports:
#   - "8001:80"  # Use 8001 instead
```

### Permission Errors

**Symptom:** Permission denied errors in logs or when accessing files

**Solution:**

```bash
# Set correct user/group IDs
echo "USER_ID=$(id -u)" >> .env
echo "GROUP_ID=$(id -g)" >> .env

# Rebuild containers
just build-dev

# Fix file ownership
docker compose -f compose.yml -f compose.dev.yml exec php chown -R www-data:www-data storage bootstrap/cache
```

### Database Connection Failed

**Symptom:** `SQLSTATE[08006] [7] could not connect to server`

**Solution:**

```bash
# Verify PostgreSQL is running and healthy
docker compose -f compose.yml -f compose.dev.yml exec postgres pg_isready

# Check connection from PHP container
docker compose -f compose.yml -f compose.dev.yml exec php php artisan tinker
> DB::connection()->getPdo();

# Verify environment variables
docker compose -f compose.yml -f compose.dev.yml exec php env | grep DB_

# Check PostgreSQL logs
just dev-logs postgres

# Recreate database
just migrate-fresh
```

### Redis Connection Failed

**Symptom:** `Connection refused [tcp://redis:6379]`

**Solution:**

```bash
# Check Redis is running
docker compose -f compose.yml -f compose.dev.yml exec redis redis-cli ping

# Test connection from PHP
docker compose -f compose.yml -f compose.dev.yml exec php php artisan tinker
> Redis::ping();

# Check Redis logs
just dev-logs redis

# Restart Redis
docker compose -f compose.yml -f compose.dev.yml restart redis
```

### Slow Performance on macOS

**Symptom:** Extremely slow page loads (>10s)

**Solution:**

```bash
# 1. Use cached volume mounts (already configured)
# volumes:
#   - ./:/var/www/html:cached

# 2. Use named volumes for vendor/node_modules
# volumes:
#   - composer_cache:/var/www/html/vendor
#   - node_modules:/var/www/html/node_modules

# 3. Increase Docker Desktop resources
# Docker Desktop → Preferences → Resources
# - CPUs: 4+
# - Memory: 8GB+
# - Swap: 2GB+

# 4. Enable VirtioFS
# Docker Desktop → Preferences → Experimental Features
# ✓ Use new Virtualization framework
# ✓ Enable VirtioFS

# 5. Use mutagen or docker-sync (advanced)
```

### Out of Disk Space

**Symptom:** `no space left on device`

**Solution:**

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes

# Remove specific volumes
docker volume ls
docker volume rm <volume_name>

# Clean Laravel caches
just clean-cache

# Remove old images
docker image prune -a
```

### Container Keeps Restarting

**Symptom:** Container in restart loop

**Solution:**

```bash
# Check exit code
docker compose -f compose.yml -f compose.dev.yml ps

# View full logs
just dev-logs

# Disable restart to debug
# In compose file: restart: "no"

# Check health checks
docker inspect <container_id> | grep -A 10 Health
```

## Laravel Issues

### 500 Internal Server Error

**Symptom:** White screen or 500 error

**Solution:**

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check Docker logs
just dev-logs php

# Enable debug mode
# .env: APP_DEBUG=true

# Clear caches
just clean-cache

# Check permissions
docker compose -f compose.yml -f compose.dev.yml exec php \
  chmod -R 775 storage bootstrap/cache
```

### Class Not Found

**Symptom:** `Class 'App\...' not found`

**Solution:**

```bash
# Regenerate autoload files
just composer dump-autoload

# Clear config cache
just artisan config:clear

# Rebuild containers
just build-dev
```

### Migration Failed

**Symptom:** Migration errors or database schema issues

**Solution:**

```bash
# Check migration status
just artisan migrate:status

# Rollback last migration
just migrate-rollback

# Fresh migration (WARNING: drops all data)
just migrate-fresh

# Reset database
just artisan migrate:fresh --seed

# Check for pending migrations
just artisan migrate:status

# Fix migration manually in database
just psql
> DELETE FROM migrations WHERE migration = 'xxxx_migration_name';
```

### Queue Not Processing

**Symptom:** Jobs stuck in queue

**Solution:**

```bash
# Check queue worker is running
docker compose -f compose.yml -f compose.dev.yml ps | grep queue

# View queue status
just artisan queue:work --once

# Clear failed jobs
just artisan queue:flush

# Restart queue workers
docker compose -f compose.yml -f compose.dev.yml restart queue

# Check Redis connection
just redis-cli
> KEYS queue:*
```

### Cache Issues

**Symptom:** Old data showing, changes not reflecting

**Solution:**

```bash
# Clear all caches
just clean-cache

# Or individually
just artisan cache:clear
just artisan config:clear
just artisan route:clear
just artisan view:clear

# Clear OPcache (production)
just artisan opcache:clear

# Restart PHP-FPM
docker compose -f compose.yml -f compose.dev.yml restart php
```

## Testing Issues

### Tests Failing Locally

**Symptom:** Tests pass in CI but fail locally (or vice versa)

**Solution:**

```bash
# Use test environment
docker compose -f compose.yml -f compose.test.yml run --rm app-test php artisan test

# Clean test database
docker compose -f compose.yml -f compose.test.yml down -v

# Check test environment variables
cat phpunit.xml | grep env

# Run specific test
just test --filter=CategoryTest

# Verbose output
just test --testdox
```

### Database Seeding Issues

**Symptom:** Seeder errors or constraint violations

**Solution:**

```bash
# Fresh database with seeding
just migrate-fresh

# Run specific seeder
just artisan db:seed --class=CategorySeeder

# Check for foreign key issues
just psql
> SELECT * FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';
```

## Build Issues

### Composer Install Fails

**Symptom:** Composer dependency resolution errors

**Solution:**

```bash
# Update composer
just composer self-update

# Clear composer cache
just composer clear-cache

# Remove lock file and reinstall
rm composer.lock
just composer install

# Check PHP version
just composer show php
```

### NPM Install Fails

**Symptom:** Node module installation errors

**Solution:**

```bash
# Clear npm cache
just npm-install
docker compose -f compose.yml -f compose.dev.yml exec node npm cache clean --force

# Remove node_modules and reinstall
docker compose -f compose.yml -f compose.dev.yml exec node rm -rf node_modules
just npm-install

# Check Node version
docker compose -f compose.yml -f compose.dev.yml exec node node --version
```

### Image Build Fails

**Symptom:** Docker build errors

**Solution:**

```bash
# Build without cache
just build-dev

# Or
docker compose -f compose.yml -f compose.dev.yml build --no-cache

# Check Dockerfile syntax
docker build --check docker/php/Dockerfile.dev

# Increase Docker build memory
# Docker Desktop → Preferences → Resources
```

## Code Quality Issues

### PHPStan Errors

**Symptom:** Static analysis failures

**Solution:**

```bash
# Run PHPStan with verbose output
just phpstan-verbose

# Generate baseline (temporary)
just artisan phpstan:baseline

# Check specific file
docker compose -f compose.yml -f compose.dev.yml exec php \
  ./vendor/bin/phpstan analyse app/Domains/Categories

# Clear PHPStan cache
rm -rf storage/phpstan
```

### Pint (Code Style) Errors

**Symptom:** Code style violations

**Solution:**

```bash
# Auto-fix all style issues
just pint

# Check without fixing
just pint-test

# Fix specific directory
docker compose -f compose.yml -f compose.dev.yml exec php \
  ./vendor/bin/pint app/Domains/Categories
```

## Development Workflow Issues

### Hot Reload Not Working

**Symptom:** Changes not reflected without manual refresh

**Solution:**

```bash
# Check Vite is running
just vite-logs

# Restart Vite
docker compose -f compose.yml -f compose.dev.yml restart node

# Check Vite configuration
cat vite.config.js

# Verify volume mounts
docker compose -f compose.yml -f compose.dev.yml config | grep volumes

# Clear browser cache
# Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)
```

### Xdebug Not Working

**Symptom:** Breakpoints not hit

**Solution:**

```bash
# Verify Xdebug is loaded
docker compose -f compose.yml -f compose.dev.yml exec php php -m | grep xdebug

# Check Xdebug configuration
docker compose -f compose.yml -f compose.dev.yml exec php php -i | grep xdebug

# Check IDE configuration
# PHPStorm: Settings → PHP → Debug
# - Port: 9003
# - Break at first line: enabled
# - Path mappings: /var/www/html → /your/local/path

# Set environment variable
export XDEBUG_SESSION=1

# Check firewall
# Ensure port 9003 is not blocked
```

### Environment Variables Not Loading

**Symptom:** `.env` changes not reflecting

**Solution:**

```bash
# Restart containers
docker compose -f compose.yml -f compose.dev.yml restart

# Clear config cache
just artisan config:clear

# Verify .env is mounted
docker compose -f compose.yml -f compose.dev.yml exec php cat .env

# Check for syntax errors in .env
cat .env | grep -v '^#' | grep -v '^$'
```

## Production Issues

### Application Down

**Symptom:** 502/503 errors

**Solution:**

```bash
# Check all services
docker compose -f compose.yml -f compose.prod.yml ps

# Check health
docker compose -f compose.yml -f compose.prod.yml exec php php artisan health:check

# Check logs
just prod-logs

# Restart services
docker compose -f compose.yml -f compose.prod.yml restart
```

### High Memory Usage

**Symptom:** Containers consuming excessive memory

**Solution:**

```bash
# Check memory usage
docker stats

# Optimize OPcache
# php-prod.ini:
# opcache.memory_consumption=256

# Increase container limits
# compose.prod.yml:
# deploy:
#   resources:
#     limits:
#       memory: 1G

# Check for memory leaks
just artisan queue:work --max-jobs=100 --max-time=3600
```

### High CPU Usage

**Symptom:** CPU at 100%

**Solution:**

```bash
# Identify process
docker stats
docker top <container_id>

# Check for infinite loops in code
# Check queue workers processing correctly
# Check scheduler not running too frequently

# Limit CPU usage
# compose.prod.yml:
# deploy:
#   resources:
#     limits:
#       cpus: '2.0'
```

## Getting Help

### Logs to Collect

When reporting issues, include:

```bash
# System information
docker --version
docker compose version
php --version

# Service status
docker compose -f compose.yml -f compose.dev.yml ps

# Recent logs
just dev-logs --tail=100 > logs.txt

# Laravel logs
tail -n 100 storage/logs/laravel.log

# Environment (sanitized)
cat .env | grep -v PASSWORD | grep -v SECRET
```

### Nuclear Option: Start Fresh

If all else fails:

```bash
# Stop everything
just dev-stop

# Remove all containers and volumes
just clean

# Remove Docker images
docker image prune -a

# Fresh setup
just setup

# Verify
just health
```

### Support Channels

1. Check [README.md](../README.md) for setup instructions
2. Review [docker/README.md](../docker/README.md) for Docker details
3. Check [.development-context/](../.development-context/) for architecture docs
4. Run `just health` for diagnostics
5. Check `storage/logs/` for application logs

## Common Error Messages

### `Connection refused`

-   Service not running
-   Wrong host/port
-   Network isolation issue
-   Health check failing

### `Permission denied`

-   File ownership issue
-   Volume mount permissions
-   User/group ID mismatch

### `No space left on device`

-   Disk full
-   Docker storage full
-   Log files too large

### `Address already in use`

-   Port conflict
-   Service already running
-   Previous container not stopped

### `SQLSTATE[HY000]`

-   Database connection issue
-   Wrong credentials
-   Database not initialized
-   Network issue

### `Class not found`

-   Autoload not regenerated
-   Missing composer install
-   Wrong namespace
-   File not in correct location
