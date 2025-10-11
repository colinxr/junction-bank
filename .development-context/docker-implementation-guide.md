# Docker Implementation Guide - Quick Start

**Purpose:** Step-by-step guide to implement the optimized Docker infrastructure for Laravel development.

---

## Quick Command Reference

```bash
# Development
make dev-up           # Start development environment
make dev-down         # Stop development environment
make dev-logs         # View logs
make dev-shell        # Access app container

# Testing
make test             # Run all tests
make test-unit        # Run unit tests only
make test-feature     # Run feature tests only

# Production
make prod-build       # Build production images
make prod-up          # Start production stack
make prod-deploy      # Full deployment workflow
```

---

## File Structure to Create

```
docker/
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── dev.conf
│   │   └── prod.conf
│   └── snippets/
│       └── ssl.conf
├── php/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── php.ini
│   ├── php-fpm.conf
│   ├── opcache.ini
│   ├── xdebug.ini
│   └── php-fpm-healthcheck
├── postgres/
│   ├── Dockerfile
│   └── init/
│       ├── 01-databases.sql
│       ├── 02-extensions.sql
│       └── 03-permissions.sql
└── redis/
    ├── Dockerfile
    └── redis.conf

compose.yml
compose.dev.yml
compose.prod.yml
compose.test.yml
Makefile
.dockerignore
.env.example
```

---

## Essential Configuration Files

### 1. `.dockerignore`

```gitignore
# Git
.git
.gitignore
.gitattributes

# IDE
.idea
.vscode
*.swp
*.swo

# Testing
coverage/
.phpunit.result.cache
tests/_output/

# Build artifacts
node_modules/
vendor/
npm-debug.log
yarn-error.log

# Environment
.env
.env.*
!.env.example

# Logs
*.log
storage/logs/

# Cache
bootstrap/cache/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/

# Temp files
temp/
tmp/
*.tmp

# Documentation (exclude from image)
README.md
CHANGELOG.md
docs/

# Development
Makefile
docker-compose*.yml
Dockerfile*
```

### 2. `.env.example` (Laravel-specific)

```env
# Application
APP_NAME="Junction Bank"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=junction_bank
DB_USERNAME=postgres
DB_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail (Development)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@junctionbank.local"
MAIL_FROM_NAME="${APP_NAME}"

# AWS (Local MinIO)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=junction-bank
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug
LOG_DEPRECATIONS_CHANNEL=null

# Docker Ports
APP_PORT=8000
APP_SSL_PORT=8443
POSTGRES_PORT=5432
REDIS_PORT=6379
MAILPIT_PORT=8025
ADMINER_PORT=8080
REDIS_COMMANDER_PORT=8081
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9090
HORIZON_PORT=9001
```

### 3. `Makefile`

```makefile
.PHONY: help dev-up dev-down dev-logs dev-shell test prod-build prod-up prod-down clean

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
NC=\033[0m # No Color

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo '${YELLOW}Available commands:${NC}'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-20s${NC} %s\n", $$1, $$2}'

##@ Development

dev-up: ## Start development environment
	@echo "${GREEN}Starting development environment...${NC}"
	docker compose -f compose.yml -f compose.dev.yml up -d
	@echo "${GREEN}Development environment is ready!${NC}"
	@echo "Application: http://localhost:8000"
	@echo "Mailpit: http://localhost:8025"
	@echo "Adminer: http://localhost:8080"
	@echo "Redis Commander: http://localhost:8081"
	@echo "MinIO: http://localhost:9090"

dev-down: ## Stop development environment
	@echo "${YELLOW}Stopping development environment...${NC}"
	docker compose -f compose.yml -f compose.dev.yml down

dev-logs: ## View development logs
	docker compose -f compose.yml -f compose.dev.yml logs -f

dev-shell: ## Access application container shell
	docker compose -f compose.yml -f compose.dev.yml exec app sh

dev-restart: ## Restart development environment
	@make dev-down
	@make dev-up

dev-fresh: ## Fresh install with migrations and seeds
	@echo "${GREEN}Fresh installation...${NC}"
	@make dev-down
	docker volume rm junction-bank_postgres-data || true
	@make dev-up
	sleep 5
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan migrate:fresh --seed

##@ Database

db-migrate: ## Run database migrations
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan migrate

db-rollback: ## Rollback last migration
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan migrate:rollback

db-seed: ## Seed database
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan db:seed

db-fresh: ## Fresh migration with seed
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan migrate:fresh --seed

db-backup: ## Backup database
	@echo "${GREEN}Backing up database...${NC}"
	docker compose -f compose.yml -f compose.dev.yml exec postgres pg_dump -U postgres junction_bank > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}Backup complete!${NC}"

##@ Testing

test: ## Run all tests
	docker compose -f compose.yml -f compose.test.yml run --rm app-test php artisan test

test-unit: ## Run unit tests
	docker compose -f compose.yml -f compose.test.yml run --rm app-test php artisan test --testsuite=Unit

test-feature: ## Run feature tests
	docker compose -f compose.yml -f compose.test.yml run --rm app-test php artisan test --testsuite=Feature

test-coverage: ## Run tests with coverage
	docker compose -f compose.yml -f compose.test.yml run --rm app-test php artisan test --coverage

test-clean: ## Clean test environment
	docker compose -f compose.yml -f compose.test.yml down -v

##@ Production

prod-build: ## Build production images
	@echo "${GREEN}Building production images...${NC}"
	docker compose -f compose.yml -f compose.prod.yml build

prod-up: ## Start production stack
	@echo "${GREEN}Starting production environment...${NC}"
	docker compose -f compose.yml -f compose.prod.yml up -d

prod-down: ## Stop production stack
	docker compose -f compose.yml -f compose.prod.yml down

prod-deploy: ## Full production deployment
	@echo "${GREEN}Deploying to production...${NC}"
	@make prod-build
	@make prod-up
	docker compose -f compose.yml -f compose.prod.yml exec app php artisan migrate --force
	docker compose -f compose.yml -f compose.prod.yml exec app php artisan config:cache
	docker compose -f compose.yml -f compose.prod.yml exec app php artisan route:cache
	docker compose -f compose.yml -f compose.prod.yml exec app php artisan view:cache
	@echo "${GREEN}Deployment complete!${NC}"

prod-logs: ## View production logs
	docker compose -f compose.yml -f compose.prod.yml logs -f

##@ Artisan

artisan: ## Run artisan command (use: make artisan CMD="route:list")
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan $(CMD)

tinker: ## Open Laravel Tinker
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan tinker

queue-work: ## Start queue worker manually
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan queue:work

queue-restart: ## Restart queue workers
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan queue:restart

cache-clear: ## Clear all caches
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan cache:clear
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan config:clear
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan route:clear
	docker compose -f compose.yml -f compose.dev.yml exec app php artisan view:clear

##@ Composer & NPM

composer-install: ## Install composer dependencies
	docker compose -f compose.yml -f compose.dev.yml exec app composer install

composer-update: ## Update composer dependencies
	docker compose -f compose.yml -f compose.dev.yml exec app composer update

npm-install: ## Install npm dependencies
	docker compose -f compose.yml -f compose.dev.yml exec node npm install

npm-dev: ## Run npm dev
	docker compose -f compose.yml -f compose.dev.yml exec node npm run dev

npm-build: ## Build assets for production
	docker compose -f compose.yml -f compose.dev.yml exec node npm run build

##@ Maintenance

clean: ## Remove all containers, volumes, and images
	@echo "${RED}WARNING: This will remove all Docker resources for this project!${NC}"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f compose.yml -f compose.dev.yml down -v --remove-orphans; \
		docker compose -f compose.yml -f compose.prod.yml down -v --remove-orphans; \
		docker compose -f compose.yml -f compose.test.yml down -v --remove-orphans; \
		echo "${GREEN}Cleanup complete!${NC}"; \
	fi

clean-cache: ## Clean Docker build cache
	docker builder prune -a

stats: ## Show Docker resource usage
	docker stats

ps: ## Show running containers
	docker compose -f compose.yml -f compose.dev.yml ps

logs-app: ## Show application logs
	docker compose -f compose.yml -f compose.dev.yml logs -f app

logs-nginx: ## Show Nginx logs
	docker compose -f compose.yml -f compose.dev.yml logs -f nginx

logs-postgres: ## Show PostgreSQL logs
	docker compose -f compose.yml -f compose.dev.yml logs -f postgres

logs-redis: ## Show Redis logs
	docker compose -f compose.yml -f compose.dev.yml logs -f redis

##@ Health Checks

health: ## Check health of all services
	@echo "${GREEN}Checking service health...${NC}"
	@docker compose -f compose.yml -f compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

restart-app: ## Restart application container
	docker compose -f compose.yml -f compose.dev.yml restart app

restart-nginx: ## Restart Nginx container
	docker compose -f compose.yml -f compose.dev.yml restart nginx

restart-postgres: ## Restart PostgreSQL container
	docker compose -f compose.yml -f compose.dev.yml restart postgres

restart-redis: ## Restart Redis container
	docker compose -f compose.yml -f compose.dev.yml restart redis
```

### 4. `docker/php/php.ini`

```ini
[PHP]
; Performance
memory_limit = 512M
max_execution_time = 60
max_input_time = 60
max_input_vars = 3000

; File uploads
upload_max_filesize = 100M
post_max_size = 100M

; Error reporting
display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
log_errors = On
error_log = /var/log/php/error.log

; Date
date.timezone = UTC

; Session
session.save_handler = redis
session.save_path = "tcp://redis:6379?database=0"
session.gc_maxlifetime = 7200
session.cookie_lifetime = 0
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = "Lax"

; Realpath cache
realpath_cache_size = 4096K
realpath_cache_ttl = 600

; OPcache (loaded separately)
[opcache]
; See opcache.ini
```

### 5. `docker/php/opcache.ini`

```ini
[opcache]
; Enable OPcache
opcache.enable=1
opcache.enable_cli=0

; Memory settings
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000

; Validation settings
opcache.revalidate_freq=2
opcache.validate_timestamps=1
opcache.fast_shutdown=1

; Optimization settings
opcache.optimization_level=0x7FFFBFFF
opcache.save_comments=1
opcache.load_comments=1

; File cache (for Docker)
opcache.file_cache=/tmp/opcache
opcache.file_cache_only=0
opcache.file_cache_consistency_checks=1

; Huge pages (if supported)
opcache.huge_code_pages=0

; JIT (PHP 8.0+)
opcache.jit_buffer_size=100M
opcache.jit=tracing
```

### 6. `docker/php/xdebug.ini`

```ini
[xdebug]
; Enable Xdebug
zend_extension=xdebug.so

; Mode
xdebug.mode=debug,develop,coverage

; Client settings
xdebug.client_host=host.docker.internal
xdebug.client_port=9003
xdebug.start_with_request=yes

; IDE Key
xdebug.idekey=PHPSTORM

; Logging
xdebug.log=/var/log/xdebug.log
xdebug.log_level=7

; Step debugging
xdebug.discover_client_host=false
xdebug.max_nesting_level=512

; Coverage
xdebug.coverage_enable=1

; Development helpers
xdebug.var_display_max_depth=10
xdebug.var_display_max_children=256
xdebug.var_display_max_data=2048
```

### 7. `docker/php/php-fpm-healthcheck`

```bash
#!/usr/bin/env sh
set -e

# Simple PHP-FPM health check using FastCGI
SCRIPT_NAME=/health \
SCRIPT_FILENAME=/health \
REQUEST_METHOD=GET \
cgi-fcgi -bind -connect 127.0.0.1:9000 || exit 1

exit 0
```

### 8. `docker/nginx/conf.d/dev.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root /var/www/html/public;
    index index.php index.html;

    charset utf-8;

    # Development - verbose logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log debug;

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static files
    location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml|svg|woff|woff2|ttf|eot)$ {
        expires 1h;
        add_header Cache-Control "public";
        access_log off;
        try_files $uri =404;
    }

    # Laravel front controller
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_connect_timeout 60;
        fastcgi_send_timeout 180;
        fastcgi_read_timeout 180;
        
        # Development - no caching
        fastcgi_param PHP_VALUE "display_errors=On";
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
        access_log off;
    }

    # Deny sensitive files
    location ~* (\.env|\.git|composer\.(json|lock))$ {
        deny all;
        return 404;
    }
}
```

### 9. `docker/postgres/init/01-databases.sql`

```sql
-- Create main database if not exists
SELECT 'CREATE DATABASE junction_bank'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'junction_bank')\gexec

-- Create test database
SELECT 'CREATE DATABASE junction_bank_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'junction_bank_test')\gexec

-- Create development database
SELECT 'CREATE DATABASE junction_bank_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'junction_bank_dev')\gexec
```

### 10. `docker/postgres/init/02-extensions.sql`

```sql
-- Connect to each database and enable extensions

\c junction_bank;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c junction_bank_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c junction_bank_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 11. `docker/postgres/init/03-permissions.sql`

```sql
-- Grant permissions to postgres user on all databases

\c junction_bank;
GRANT ALL PRIVILEGES ON DATABASE junction_bank TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;

\c junction_bank_test;
GRANT ALL PRIVILEGES ON DATABASE junction_bank_test TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

\c junction_bank_dev;
GRANT ALL PRIVILEGES ON DATABASE junction_bank_dev TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;
```

### 12. `docker/redis/redis.conf`

```conf
# Network
bind 0.0.0.0
protected-mode yes
port 6379

# General
daemonize no
pidfile /var/run/redis.pid
loglevel notice
logfile ""

# Snapshotting (persistence)
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Replication
replica-serve-stale-data yes
replica-read-only yes

# Limits
maxclients 10000
maxmemory 256mb
maxmemory-policy allkeys-lru

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency monitor
latency-monitor-threshold 100

# Event notification
notify-keyspace-events ""

# Advanced config
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
```

---

## Setup Workflow

### Initial Setup (First Time)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/junction-bank.git
cd junction-bank

# 2. Create environment file
cp .env.example .env

# 3. Build and start containers
make dev-up

# 4. Install dependencies
make composer-install
make npm-install

# 5. Generate application key
docker compose exec app php artisan key:generate

# 6. Run migrations
make db-migrate

# 7. Seed database
make db-seed

# 8. Access application
open http://localhost:8000
```

### Daily Development Workflow

```bash
# Start work
make dev-up

# View logs
make dev-logs

# Run migrations
make db-migrate

# Run tests
make test

# Clear cache
make cache-clear

# End work
make dev-down
```

### Debugging Workflow

```bash
# 1. Ensure Xdebug is enabled (already in dev environment)

# 2. Configure your IDE:
# - PHPStorm: Add Docker interpreter, map paths
# - VSCode: Configure launch.json

# 3. Set breakpoints in code

# 4. Make request from browser

# 5. Debug in IDE
```

### Testing Workflow

```bash
# Run all tests
make test

# Run specific suite
make test-unit
make test-feature

# Run with coverage
make test-coverage

# Clean up after tests
make test-clean
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8000

# Change port in .env
APP_PORT=8080

# Restart
make dev-restart
```

### Database Connection Failed

```bash
# Check if PostgreSQL is healthy
make health

# Check logs
make logs-postgres

# Restart PostgreSQL
make restart-postgres

# Fresh start
make dev-fresh
```

### Permission Issues

```bash
# Fix storage permissions
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

### Cache Issues

```bash
# Clear all caches
make cache-clear

# Or manually
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear
docker compose exec app composer dump-autoload
```

### Xdebug Not Working

```bash
# Check Xdebug is loaded
docker compose exec app php -v | grep Xdebug

# Check configuration
docker compose exec app php -i | grep xdebug

# Verify firewall allows port 9003
```

### Slow Performance (macOS)

```yaml
# In compose.dev.yml, use :cached for volumes
volumes:
  - ./:/var/www/html:cached
  
# Or use named volumes for vendor
volumes:
  - php-vendor:/var/www/html/vendor
```

---

## IDE Configuration

### PHPStorm

1. **Docker Interpreter:**
   - Settings → PHP → CLI Interpreter
   - Add Docker Compose interpreter
   - Service: `app`
   - Lifecycle: Connect to existing container

2. **Xdebug:**
   - Settings → PHP → Debug
   - Xdebug port: 9003
   - Can accept external connections: ✓
   
3. **Path Mappings:**
   - Project root → `/var/www/html`

### VSCode

```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/var/www/html": "${workspaceFolder}"
            }
        }
    ]
}
```

---

## Performance Tips

1. **Use named volumes for dependencies:**
   ```yaml
   volumes:
     - php-vendor:/var/www/html/vendor
     - node-modules:/var/www/html/node_modules
   ```

2. **Enable BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   export COMPOSE_DOCKER_CLI_BUILD=1
   ```

3. **Prune regularly:**
   ```bash
   docker system prune -a --volumes
   ```

4. **Use :cached flag on macOS:**
   ```yaml
   volumes:
     - ./:/var/www/html:cached
   ```

---

## Next Steps

1. ✅ Create file structure
2. ✅ Copy configuration files
3. ✅ Set up environment variables
4. ✅ Build and test development environment
5. ⏭️ Migrate first domain model
6. ⏭️ Set up CI/CD pipeline
7. ⏭️ Optimize for production

---

**Related Documents:**
- `.development-context/docker-optimization-report.md` - Detailed analysis
- `.development-context/ADRs/001-docker-laravel-infrastructure.md` - Architectural decision
- `.development-context/migration-checklist.md` - Migration plan


