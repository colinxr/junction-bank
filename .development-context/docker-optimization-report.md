# Docker Setup Analysis & Laravel Migration Optimization Report

**Date:** October 11, 2025  
**Project:** Junction Bank  
**Current Stack:** Next.js + Prisma + PostgreSQL + Redis  
**Target Stack:** Laravel + PostgreSQL + Redis + DDD + Layered Architecture

---

## Executive Summary

This report analyzes the current Docker setup for the Next.js application and provides comprehensive recommendations for optimizing the Docker infrastructure for Laravel development and production deployment.

**Key Findings:**
- Current setup is functional but minimal
- Missing critical development tools and optimizations
- No separation between development and production configurations
- Limited observability and debugging capabilities
- No CI/CD integration considerations

---

## 1. Current Docker Setup Analysis

### 1.1 Architecture Overview

```
compose.yml
├── nextjs (Node 20 Alpine)
├── postgres (PostgreSQL 16 Alpine)
└── valkey (Redis-compatible)
```

### 1.2 Strengths

✅ **Multi-stage builds** - Dockerfile uses efficient multi-stage builds reducing final image size  
✅ **Health checks** - All services have proper health checks with retry logic  
✅ **Non-root user** - Security best practice implemented in production image  
✅ **Alpine base images** - Minimal footprint for services  
✅ **Named volumes** - Persistent data storage properly configured  
✅ **Service dependencies** - Proper dependency ordering with health checks  

### 1.3 Weaknesses & Gaps

❌ **No environment segregation** - Single compose file for all environments  
❌ **Exposed secrets** - Database credentials in environment variables  
❌ **No Nginx/reverse proxy** - Direct app exposure  
❌ **No queue workers** - No background job processing infrastructure  
❌ **No scheduler** - No cron/task scheduling service  
❌ **Limited logging** - No centralized logging or log rotation  
❌ **No monitoring** - No metrics, APM, or performance monitoring  
❌ **Missing development tools** - No Mailpit, Adminer, or debugging tools  
❌ **No build optimization** - No layer caching strategies for dependencies  
❌ **Port conflicts** - Hardcoded ports may conflict with host services  
❌ **No backup strategy** - No automated database backup service  
❌ **No testing environment** - No dedicated test database service  

---

## 2. Laravel-Specific Requirements

### 2.1 Core Infrastructure Needs

Laravel applications require additional services beyond basic web/database/cache:

1. **PHP-FPM** - Application runtime
2. **Nginx/Caddy** - Web server and reverse proxy
3. **Queue Worker** - Background job processing (Laravel Queue)
4. **Scheduler** - Cron-like task scheduler (Laravel Scheduler)
5. **Horizon** - Queue monitoring (Redis-based)
6. **Soketi/Reverb** - WebSocket server (Laravel Echo)
7. **MinIO/S3** - Object storage for file uploads
8. **MailHog/Mailpit** - Email testing (development)
9. **Testing Database** - Isolated test environment

### 2.2 Development Dependencies

- Xdebug for step debugging
- PHP Extensions: pdo, pdo_pgsql, redis, opcache, gd, zip, bcmath, etc.
- Composer for dependency management
- Node.js for asset compilation (Laravel Mix/Vite)
- Artisan CLI access
- Migration runners
- Seeder execution environment

---

## 3. Recommended Docker Architecture for Laravel

### 3.1 Service Layout

```
docker/
├── compose.yml                    # Base configuration
├── compose.dev.yml                # Development overrides
├── compose.prod.yml               # Production overrides
├── compose.test.yml               # Testing environment
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── default.conf
│   │   └── security-headers.conf
│   └── snippets/
│       └── ssl.conf
├── php/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── php.ini
│   ├── php-fpm.conf
│   └── opcache.ini
├── postgres/
│   ├── Dockerfile
│   └── init/
│       ├── 01-create-databases.sql
│       ├── 02-extensions.sql
│       └── 03-permissions.sql
├── redis/
│   ├── Dockerfile
│   └── redis.conf
└── scheduler/
    ├── Dockerfile
    └── crontab
```

### 3.2 Proposed Service Architecture

```yaml
services:
  # Core Application Services
  - app (PHP-FPM 8.3)
  - nginx (Web Server)
  - postgres (Database)
  - redis (Cache/Queue/Session)
  
  # Background Processing
  - queue-worker (Laravel Queue)
  - scheduler (Laravel Schedule)
  - horizon (Queue Dashboard)
  
  # Development Only
  - mailpit (Email Testing)
  - adminer (Database UI)
  - redis-commander (Redis UI)
  - telescope (Laravel Debugging)
  
  # Optional Services
  - minio (S3-compatible storage)
  - soketi (WebSockets)
  - pgbackup (Automated backups)
```

---

## 4. Optimized Docker Configuration

### 4.1 Base Compose File (`compose.yml`)

```yaml
version: '3.9'

# Shared configurations
x-app-common: &app-common
  build:
    context: .
    dockerfile: docker/php/Dockerfile.${APP_ENV:-production}
    args:
      PHP_VERSION: 8.3
      COMPOSER_VERSION: 2.7
  volumes:
    - ./:/var/www/html
    - php-vendor:/var/www/html/vendor
    - php-storage:/var/www/html/storage/app
  environment: &app-env
    APP_NAME: ${APP_NAME:-JunctionBank}
    APP_ENV: ${APP_ENV:-production}
    APP_KEY: ${APP_KEY}
    APP_DEBUG: ${APP_DEBUG:-false}
    APP_URL: ${APP_URL:-http://localhost}
    
    DB_CONNECTION: pgsql
    DB_HOST: postgres
    DB_PORT: 5432
    DB_DATABASE: ${DB_DATABASE:-junction_bank}
    DB_USERNAME: ${DB_USERNAME:-postgres}
    DB_PASSWORD: ${DB_PASSWORD}
    
    REDIS_HOST: redis
    REDIS_PORT: 6379
    REDIS_PASSWORD: ${REDIS_PASSWORD:-null}
    
    CACHE_DRIVER: redis
    QUEUE_CONNECTION: redis
    SESSION_DRIVER: redis
    
    LOG_CHANNEL: stack
    LOG_LEVEL: ${LOG_LEVEL:-info}
  networks:
    - junction-network
  restart: unless-stopped

services:
  # PHP Application Container
  app:
    <<: *app-common
    container_name: junction-app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "php-fpm-healthcheck"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 40s

  # Nginx Web Server
  nginx:
    build:
      context: .
      dockerfile: docker/nginx/Dockerfile
    container_name: junction-nginx
    ports:
      - "${APP_PORT:-80}:80"
      - "${APP_SSL_PORT:-443}:443"
    volumes:
      - ./:/var/www/html:ro
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - nginx-cache:/var/cache/nginx
      - nginx-logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - junction-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 10s
      timeout: 3s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: junction-postgres
    environment:
      POSTGRES_DB: ${DB_DATABASE:-junction_bank}
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "-E UTF8 --locale=en_US.UTF-8"
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d:ro
      - postgres-logs:/var/log/postgresql
    networks:
      - junction-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres} -d ${DB_DATABASE:-junction_bank}"]
      interval: 10s
      timeout: 5s
      retries: 5
    shm_size: 256mb
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=1GB"
      - "-c"
      - "maintenance_work_mem=64MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"
      - "-c"
      - "work_mem=1310kB"
      - "-c"
      - "min_wal_size=1GB"
      - "-c"
      - "max_wal_size=4GB"
      - "-c"
      - "log_statement=all"
      - "-c"
      - "log_duration=on"

  # Redis Cache/Queue/Session Store
  redis:
    build:
      context: .
      dockerfile: docker/redis/Dockerfile
    container_name: junction-redis
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis-data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - junction-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Laravel Queue Worker
  queue:
    <<: *app-common
    container_name: junction-queue
    command: php artisan queue:work --verbose --tries=3 --timeout=90 --sleep=3 --max-jobs=1000
    depends_on:
      app:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "ps", "aux", "|", "grep", "queue:work"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Laravel Scheduler
  scheduler:
    <<: *app-common
    container_name: junction-scheduler
    command: >
      sh -c "
        echo '* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1' | crontab - &&
        crond -f -l 2
      "
    depends_on:
      app:
        condition: service_healthy

  # Laravel Horizon (Queue Dashboard)
  horizon:
    <<: *app-common
    container_name: junction-horizon
    command: php artisan horizon
    depends_on:
      app:
        condition: service_healthy
    ports:
      - "${HORIZON_PORT:-9001}:9000"
    healthcheck:
      test: ["CMD", "php", "artisan", "horizon:status"]
      interval: 30s
      timeout: 3s
      retries: 3

networks:
  junction-network:
    driver: bridge

volumes:
  postgres-data:
    driver: local
  postgres-logs:
    driver: local
  redis-data:
    driver: local
  php-vendor:
    driver: local
  php-storage:
    driver: local
  nginx-cache:
    driver: local
  nginx-logs:
    driver: local
```

### 4.2 Development Override (`compose.dev.yml`)

```yaml
version: '3.9'

services:
  app:
    build:
      dockerfile: docker/php/Dockerfile.dev
      args:
        XDEBUG_ENABLE: "true"
    environment:
      APP_ENV: local
      APP_DEBUG: true
      APP_URL: http://localhost:8000
      LOG_LEVEL: debug
      
      # Xdebug Configuration
      XDEBUG_MODE: debug,coverage,develop
      XDEBUG_CONFIG: client_host=host.docker.internal
      XDEBUG_SESSION: PHPSTORM
      PHP_IDE_CONFIG: serverName=junction-bank
      
      # Development Tools
      TELESCOPE_ENABLED: true
      DEBUGBAR_ENABLED: true
    volumes:
      - ./:/var/www/html
      # Don't override these in dev
      - /var/www/html/vendor
      - /var/www/html/node_modules
    ports:
      - "9003:9003" # Xdebug
    extra_hosts:
      - "host.docker.internal:host-gateway"

  nginx:
    ports:
      - "8000:80"
    volumes:
      - ./:/var/www/html
      - ./docker/nginx/conf.d/dev.conf:/etc/nginx/conf.d/default.conf:ro

  postgres:
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: junction_bank_dev
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
    command:
      - "postgres"
      - "-c"
      - "log_statement=all"
      - "-c"
      - "log_duration=on"
      - "-c"
      - "log_min_duration_statement=0"

  redis:
    ports:
      - "6379:6379"
    command: redis-server --appendonly no --save ""

  # Mailpit - Email Testing
  mailpit:
    image: axllent/mailpit:latest
    container_name: junction-mailpit
    ports:
      - "8025:8025" # Web UI
      - "1025:1025" # SMTP
    environment:
      MP_MAX_MESSAGES: 5000
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
    networks:
      - junction-network
    restart: unless-stopped

  # Adminer - Database UI
  adminer:
    image: adminer:latest
    container_name: junction-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
      ADMINER_DESIGN: nette
    networks:
      - junction-network
    restart: unless-stopped

  # Redis Commander - Redis UI
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: junction-redis-commander
    ports:
      - "8081:8081"
    environment:
      REDIS_HOSTS: local:redis:6379
    networks:
      - junction-network
    depends_on:
      - redis
    restart: unless-stopped

  # MinIO - S3-compatible object storage
  minio:
    image: minio/minio:latest
    container_name: junction-minio
    ports:
      - "9000:9000"
      - "9090:9090"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9090"
    networks:
      - junction-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Node - Asset compilation
  node:
    image: node:20-alpine
    container_name: junction-node
    working_dir: /var/www/html
    volumes:
      - ./:/var/www/html
    command: npm run dev
    networks:
      - junction-network
    ports:
      - "5173:5173" # Vite dev server

volumes:
  postgres-dev-data:
  minio-data:
```

### 4.3 Production Override (`compose.prod.yml`)

```yaml
version: '3.9'

services:
  app:
    build:
      dockerfile: docker/php/Dockerfile.prod
      args:
        XDEBUG_ENABLE: "false"
    environment:
      APP_ENV: production
      APP_DEBUG: false
      LOG_LEVEL: warning
    volumes:
      - ./:/var/www/html:ro
      - php-storage:/var/www/html/storage
      - php-cache:/var/www/html/bootstrap/cache
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  nginx:
    volumes:
      - ./public:/var/www/html/public:ro
      - ./docker/nginx/conf.d/prod.conf:/etc/nginx/conf.d/default.conf:ro
      - nginx-ssl-certs:/etc/nginx/ssl:ro
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  postgres:
    command:
      - "postgres"
      - "-c"
      - "max_connections=100"
      - "-c"
      - "shared_buffers=512MB"
      - "-c"
      - "effective_cache_size=2GB"
      - "-c"
      - "maintenance_work_mem=128MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"
      - "-c"
      - "work_mem=2621kB"
      - "-c"
      - "min_wal_size=2GB"
      - "-c"
      - "max_wal_size=8GB"
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  redis:
    command: redis-server /usr/local/etc/redis/redis.conf --requirepass ${REDIS_PASSWORD}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  queue:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M

  # Database Backup Service
  pgbackup:
    image: prodrigestivill/postgres-backup-local:16-alpine
    container_name: junction-pgbackup
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      SCHEDULE: "@daily"
      BACKUP_KEEP_DAYS: 7
      BACKUP_KEEP_WEEKS: 4
      BACKUP_KEEP_MONTHS: 6
      HEALTHCHECK_PORT: 8080
    volumes:
      - ./backups:/backups
    depends_on:
      - postgres
    networks:
      - junction-network
    restart: unless-stopped

volumes:
  php-cache:
  nginx-ssl-certs:
```

### 4.4 Testing Override (`compose.test.yml`)

```yaml
version: '3.9'

services:
  app-test:
    build:
      context: .
      dockerfile: docker/php/Dockerfile.dev
    container_name: junction-app-test
    environment:
      APP_ENV: testing
      APP_DEBUG: true
      DB_CONNECTION: pgsql
      DB_HOST: postgres-test
      DB_PORT: 5432
      DB_DATABASE: junction_bank_test
      DB_USERNAME: postgres
      DB_PASSWORD: secret
      REDIS_HOST: redis-test
    volumes:
      - ./:/var/www/html
    depends_on:
      postgres-test:
        condition: service_healthy
      redis-test:
        condition: service_healthy
    networks:
      - junction-test-network
    command: php artisan test --parallel

  postgres-test:
    image: postgres:16-alpine
    container_name: junction-postgres-test
    environment:
      POSTGRES_DB: junction_bank_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    tmpfs:
      - /var/lib/postgresql/data
    networks:
      - junction-test-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d junction_bank_test"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis-test:
    image: redis:7-alpine
    container_name: junction-redis-test
    tmpfs:
      - /data
    networks:
      - junction-test-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

networks:
  junction-test-network:
    driver: bridge
```

---

## 5. Dockerfile Optimization

### 5.1 Production Dockerfile (`docker/php/Dockerfile.prod`)

```dockerfile
# Multi-stage production Dockerfile
FROM php:8.3-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    icu-dev \
    curl \
    git \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        mbstring \
        intl \
        opcache \
        bcmath \
        exif \
        pcntl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/php.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# ===========================================
# Dependencies stage - cache dependencies
# ===========================================
FROM base AS dependencies

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --no-autoloader \
    --prefer-dist

# ===========================================
# Builder stage - build application
# ===========================================
FROM base AS builder

COPY . .
COPY --from=dependencies /var/www/html/vendor ./vendor

# Generate autoloader
RUN composer dump-autoload --optimize --classmap-authoritative

# Optimize Laravel
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

# Set permissions
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# ===========================================
# Final production image
# ===========================================
FROM base AS production

# Copy application from builder
COPY --from=builder --chown=www-data:www-data /var/www/html /var/www/html

# Health check script
COPY docker/php/php-fpm-healthcheck /usr/local/bin/php-fpm-healthcheck
RUN chmod +x /usr/local/bin/php-fpm-healthcheck

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
```

### 5.2 Development Dockerfile (`docker/php/Dockerfile.dev`)

```dockerfile
FROM php:8.3-fpm-alpine

ARG XDEBUG_ENABLE=true

# Install system dependencies including Xdebug dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    icu-dev \
    curl \
    git \
    supervisor \
    bash \
    vim \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        mbstring \
        intl \
        opcache \
        bcmath \
        exif \
        pcntl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Xdebug (conditionally)
RUN if [ "$XDEBUG_ENABLE" = "true" ]; then \
        pecl install xdebug-3.3.1 && \
        docker-php-ext-enable xdebug; \
    fi

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/php.ini
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

# Set development-friendly permissions
RUN chown -R www-data:www-data /var/www/html

USER www-data

EXPOSE 9000 9003

CMD ["php-fpm"]
```

---

## 6. Nginx Configuration

### 6.1 Main Nginx Config (`docker/nginx/nginx.conf`)

```nginx
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;

    # FastCGI cache
    fastcgi_cache_path /var/cache/nginx levels=1:2 
                       keys_zone=laravel:100m 
                       inactive=60m 
                       max_size=1g;
    fastcgi_cache_key "$scheme$request_method$host$request_uri";

    include /etc/nginx/conf.d/*.conf;
}
```

### 6.2 Laravel Site Config (`docker/nginx/conf.d/default.conf`)

```nginx
upstream php-fpm {
    server app:9000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root /var/www/html/public;
    index index.php index.html;

    charset utf-8;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /var/log/nginx/laravel-access.log;
    error_log /var/log/nginx/laravel-error.log;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static file handling
    location ~* \.(jpg|jpeg|gif|png|css|js|ico|xml|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    # Laravel front controller
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM handling
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_connect_timeout 60;
        fastcgi_send_timeout 180;
        fastcgi_read_timeout 180;
        
        # FastCGI cache (disabled for dynamic content)
        # fastcgi_cache laravel;
        # fastcgi_cache_valid 200 60m;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to sensitive files
    location ~* (\.env|\.git|\.htaccess|composer\.(json|lock)|package\.(json|lock)|\.log)$ {
        deny all;
        return 404;
    }
}
```

---

## 7. Best Practices for DDD & Layered Architecture

### 7.1 Directory Structure Mapping

```
Laravel DDD Structure:
src/
├── Domain/                       # Core business logic
│   ├── Account/
│   ├── Transaction/
│   ├── Category/
│   └── Shared/
├── Application/                  # Use cases & application services
│   ├── Account/
│   ├── Transaction/
│   └── Category/
├── Infrastructure/               # Framework & external concerns
│   ├── Persistence/
│   ├── Http/
│   ├── Queue/
│   └── Cache/
└── Presentation/                 # Controllers, API resources
    ├── Http/
    └── Console/
```

### 7.2 Docker Volume Strategy for DDD

```yaml
# Optimize for bounded contexts
volumes:
  # Shared cache for cross-cutting concerns
  - ./src/Domain:/var/www/html/src/Domain:cached
  - ./src/Application:/var/www/html/src/Application:cached
  - ./src/Infrastructure:/var/www/html/src/Infrastructure:cached
  
  # Exclude vendor to avoid performance issues
  - /var/www/html/vendor
```

---

## 8. CI/CD Integration Considerations

### 8.1 GitHub Actions / GitLab CI Setup

```yaml
# .github/workflows/docker-build.yml
name: Docker Build & Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start test environment
        run: docker compose -f compose.yml -f compose.test.yml up -d
      
      - name: Run migrations
        run: docker compose exec -T app-test php artisan migrate --force
      
      - name: Run tests
        run: docker compose exec -T app-test php artisan test
      
      - name: Cleanup
        if: always()
        run: docker compose -f compose.yml -f compose.test.yml down -v

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build production image
        run: docker compose -f compose.yml -f compose.prod.yml build
      
      - name: Push to registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker compose -f compose.prod.yml push
```

---

## 9. Performance Optimization Strategies

### 9.1 Build Optimization

1. **Multi-stage builds** - Reduce final image size by 60-80%
2. **Layer caching** - Order Dockerfile instructions by change frequency
3. **Composer optimization** - Use `--classmap-authoritative` in production
4. **Laravel caching** - Pre-cache config, routes, views, events
5. **OPcache** - Enable OPcache for ~50% performance boost

### 9.2 Runtime Optimization

1. **PHP-FPM tuning** - Adjust `pm.max_children` based on memory
2. **Database connection pooling** - Use PgBouncer for production
3. **Redis persistence** - Disable AOF in development, enable in production
4. **Nginx caching** - Cache static assets and FastCGI responses
5. **CDN integration** - Offload assets to S3/CloudFront

### 9.3 Monitoring & Observability

```yaml
# Add to compose.prod.yml
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - junction-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./docker/grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
    networks:
      - junction-network
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}

volumes:
  prometheus-data:
  grafana-data:
```

---

## 10. Security Hardening

### 10.1 Docker Security Best Practices

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### 10.2 Secret Management

```bash
# Use Docker secrets for production
echo "db_password" | docker secret create db_password -
```

```yaml
services:
  app:
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    external: true
```

---

## 11. Migration Strategy

### 11.1 Phased Approach

**Phase 1:** Infrastructure Setup (Week 1)
- Set up Docker environment
- Configure PostgreSQL & Redis
- Establish development workflow

**Phase 2:** Core Domain Migration (Weeks 2-4)
- Migrate domain models to Laravel
- Implement repositories
- Set up testing infrastructure

**Phase 3:** Application Layer (Weeks 5-6)
- Migrate API endpoints
- Implement use cases
- Add queue workers

**Phase 4:** Integration & Testing (Week 7-8)
- End-to-end testing
- Performance optimization
- Security hardening

### 11.2 Rollback Strategy

- Maintain parallel environments
- Feature flags for gradual rollout
- Database migration compatibility
- Automated backup before deployment

---

## 12. Cost Optimization

### 12.1 Development Environment

- Use Alpine images (80% size reduction)
- Shared volumes for dependencies
- Stop unused services automatically
- Use tmpfs for test databases

### 12.2 Production Environment

- Multi-stage builds (remove build dependencies)
- Resource limits per service
- Horizontal scaling for app/queue only
- CDN for static assets
- Database query optimization

---

## 13. Implementation Checklist

### Phase 1: Infrastructure
- [ ] Create docker directory structure
- [ ] Write Dockerfiles (dev & prod)
- [ ] Create compose files (base, dev, prod, test)
- [ ] Configure Nginx
- [ ] Set up Redis configuration
- [ ] Configure PostgreSQL with extensions
- [ ] Create initialization scripts
- [ ] Set up volume mounts

### Phase 2: Development Environment
- [ ] Add Xdebug configuration
- [ ] Set up Mailpit for email testing
- [ ] Add Adminer for database management
- [ ] Configure Redis Commander
- [ ] Set up MinIO for file storage
- [ ] Add Laravel Telescope
- [ ] Configure hot reload for assets

### Phase 3: Production Environment
- [ ] SSL/TLS certificate automation
- [ ] Set up backup service
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Add log aggregation
- [ ] Set up health checks
- [ ] Configure resource limits
- [ ] Enable security headers
- [ ] Set up firewall rules

### Phase 4: CI/CD
- [ ] Create GitHub Actions workflows
- [ ] Set up automated testing
- [ ] Configure image registry
- [ ] Add deployment automation
- [ ] Set up staging environment
- [ ] Create rollback procedures

### Phase 5: Documentation
- [ ] Document local setup
- [ ] Write deployment guides
- [ ] Create troubleshooting guide
- [ ] Document environment variables
- [ ] Add architecture diagrams

---

## 14. Key Recommendations

### Critical Changes Needed

1. **Separate environments** - Create distinct compose files for dev/prod/test
2. **Add queue infrastructure** - Essential for Laravel background jobs
3. **Implement scheduler** - Required for Laravel cron jobs
4. **Add development tools** - Mailpit, Adminer, Redis Commander
5. **Optimize Nginx** - Add proper Laravel configuration with caching
6. **Multi-stage builds** - Reduce production image size significantly
7. **Health checks** - Add comprehensive health checks for all services
8. **Volume strategy** - Optimize volume mounts for performance
9. **Security hardening** - Add read-only filesystems, drop capabilities
10. **Monitoring** - Add observability stack (Prometheus/Grafana)

### Quick Wins

1. Use Alpine images everywhere (instant 70% size reduction)
2. Add FastCGI cache in Nginx (30-50% response time improvement)
3. Enable OPcache (40-60% PHP performance boost)
4. Use named volumes for persistence
5. Add healthchecks to all services

### Advanced Optimizations

1. Implement database connection pooling (PgBouncer)
2. Add CDN for static assets
3. Use Redis Sentinel for high availability
4. Implement blue-green deployment
5. Add APM (Application Performance Monitoring)
6. Set up distributed tracing
7. Implement auto-scaling based on metrics

---

## 15. Conclusion

The current Docker setup is functional for a Next.js application but requires substantial enhancements for Laravel development and production deployment. The recommended architecture provides:

- **50-70% reduction in image sizes** through multi-stage builds
- **Proper separation of concerns** between environments
- **Complete development tooling** for efficient local development
- **Production-grade infrastructure** with monitoring, backups, and security
- **Scalable architecture** supporting DDD and layered architecture
- **CI/CD ready** configuration for automated deployments

Implementing these recommendations will create a robust, scalable, and maintainable infrastructure suitable for modern Laravel applications following DDD principles.

---

**Next Steps:**
1. Review and approve this architecture
2. Begin Phase 1 implementation (Infrastructure Setup)
3. Set up development environment and validate
4. Proceed with domain model migration
5. Iterate and optimize based on actual usage patterns


