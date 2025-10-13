# Docker Architecture

Technical deep-dive into the Docker infrastructure for Junction Bank.

## Design Principles

1. **Security First**: Read-only filesystems, minimal capabilities, non-root users
2. **Environment Parity**: Dev/staging/prod configurations share base
3. **Performance**: Multi-stage builds, optimized images, caching
4. **DDD Support**: Volume structure supports Domain-Driven Design
5. **Observability**: Health checks, structured logging, monitoring hooks

## Image Strategy

### Multi-Stage Builds

Production Dockerfile uses multi-stage pattern:

```
┌─────────────┐
│    Base     │  Alpine + System deps
└──────┬──────┘
       │
┌──────▼──────┐
│   Builder   │  Install PHP extensions
└──────┬──────┘
       │
┌──────▼──────┐
│ Production  │  Copy only runtime artifacts
└─────────────┘
```

Benefits:

- Smaller final image (~150MB vs ~500MB)
- No build dependencies in production
- Faster deployments
- Reduced attack surface

### Image Layers

Optimized layer ordering (least to most frequently changed):

1. Base OS + system packages
2. PHP extensions
3. PHP configuration
4. Application dependencies (Composer)
5. Application code

## Network Architecture

### Development

```
┌──────────────────────────────────────────────┐
│  junction-bank-network (bridge)              │
│                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  Caddy  │◄───┤   PHP   │◄───┤  Queue  │ │
│  └────┬────┘    └────┬────┘    └────┬────┘ │
│       │              │              │       │
│  ┌────▼─────┐   ┌───▼───┐     ┌────▼────┐  │
│  │ Postgres │   │ Redis │     │ MailHog │  │
│  └──────────┘   └───────┘     └─────────┘  │
└──────────────────────────────────────────────┘
         │              │              │
    Port 5432      Port 6379      Port 1025
         │              │              │
    ┌────▼──────────────▼──────────────▼─────┐
    │         Host Machine                    │
    └─────────────────────────────────────────┘
```

### Production

```
┌──────────────────────────────────────────────┐
│  junction-bank-network (bridge)              │
│                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  │  Caddy  │◄───┤ PHP (×2)│◄───┤ Queue(×2)│ │
│  └────┬────┘    └────┬────┘    └────┬────┘ │
│       │              │              │       │
│  ┌────▼─────┐   ┌───▼───┐     ┌────▼────┐  │
│  │ Postgres │   │ Redis │     │Scheduler│  │
│  └──────────┘   └───────┘     └─────────┘  │
└──────────────────────────────────────────────┘
         │
    Port 80/443 (only exposed)
         │
    ┌────▼─────────────────────────────────────┐
    │         Internet                          │
    └───────────────────────────────────────────┘
```

No database ports exposed in production.

## Volume Strategy

### Named Volumes vs Bind Mounts

**Development**: Bind mounts for hot reload

```yaml
volumes:
  - ./app:/var/www/html:cached # Host ↔ Container sync
```

**Production**: Named volumes for persistence

```yaml
volumes:
  - ./app:/var/www/html:ro # Read-only application code
  - php_storage:/var/www/html/storage # Writable data
```

### DDD Volume Structure

Application structure optimized for DDD:

```
/var/www/html/
├── Domain/              # Pure business logic (read-only in prod)
├── Application/         # Use cases (read-only in prod)
├── Infrastructure/      # Framework integration (read-only in prod)
├── Presentation/        # Controllers, views (read-only in prod)
├── storage/            # Writable: logs, cache, sessions
│   ├── app/
│   ├── framework/
│   └── logs/
└── bootstrap/cache/    # Writable: compiled views, routes
```

### tmpfs for Performance

Test environment uses tmpfs for speed:

```yaml
tmpfs:
  - /var/lib/postgresql/data # Database in memory
```

Benefits:

- 10-100x faster than disk
- Automatic cleanup
- No persistence needed for tests

## Security Hardening

### Capability Dropping

```yaml
cap_drop:
  - ALL # Remove all Linux capabilities
cap_add:
  - CHOWN # Only add what's needed
  - SETGID
  - SETUID
```

### Read-Only Filesystem

```yaml
read_only: true # Root filesystem read-only
volumes:
  - /tmp # Writable temp directory
  - php_storage:/var/www/html/storage # Writable storage
```

### Non-Root User

```dockerfile
RUN adduser -D -u 1000 -G laravel laravel
USER laravel
```

All processes run as unprivileged user (UID 1000).

### Security Options

```yaml
security_opt:
  - no-new-privileges:true # Prevent privilege escalation
```

## Health Check Strategy

### PHP-FPM

```yaml
healthcheck:
  test: ["CMD", "php-fpm", "-t"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Tests PHP-FPM configuration validity.

### Caddy

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost/api/health"]
  interval: 30s
```

Requires `/api/health` endpoint in Laravel application.

### PostgreSQL

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
  interval: 10s
```

Verifies database accepts connections.

### Redis

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
```

Checks Redis responsiveness.

## Resource Management

### Development

Unlimited resources for local development.

### Production

Resource limits prevent container sprawl:

```yaml
deploy:
  resources:
    limits:
      cpus: "1" # Maximum 1 CPU core
      memory: 512M # Maximum 512MB RAM
    reservations:
      cpus: "0.5" # Reserved 0.5 CPU
      memory: 256M # Reserved 256MB
```

### Scaling Strategy

```yaml
deploy:
  replicas: 2 # Run 2 PHP-FPM instances
  update_config:
    parallelism: 1 # Update one at a time
    delay: 10s # Wait 10s between updates
    order: start-first # Start new before stopping old
```

Zero-downtime deployments.

## Performance Tuning

### PHP OPcache

Production configuration:

```ini
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0      # Never check file changes
opcache.jit_buffer_size = 100M       # PHP 8.3 JIT
opcache.jit = tracing
```

### PostgreSQL

Development tuning:

```sql
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
```

Production tuning:

```sql
shared_buffers = 512MB
effective_cache_size = 2GB
work_mem = 32MB
max_parallel_workers = 4
```

### Redis

```conf
maxmemory 256mb                     # Memory limit
maxmemory-policy allkeys-lru        # Evict least recently used
lazyfree-lazy-eviction yes          # Background eviction
```

## Logging Strategy

### Development

All logs to stdout/stderr for easy debugging:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Production

Structured JSON logging:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "50m"
    max-file: "5"
```

Integrate with log aggregation (ELK, Datadog, etc.)

## Backup Strategy

### Database Backups

Production compose includes backup service:

```yaml
backup:
  image: postgres:16-alpine
  volumes:
    - ./docker/postgres/backups:/backups
  entrypoint: >
    sh -c "
      pg_dump -Fc > /backups/backup_$(date +%Y%m%d_%H%M%S).dump &&
      find /backups -name '*.dump' -mtime +30 -delete
    "
```

Schedule via cron:

```cron
0 2 * * * docker compose -f compose.yml -f compose.prod.yml run backup
```

### Volume Backups

```bash
# Backup named volume
docker run --rm \
  -v junction-bank-postgres-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres-data.tar.gz -C /data .

# Restore named volume
docker run --rm \
  -v junction-bank-postgres-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres-data.tar.gz -C /data
```

## Testing Infrastructure

### Isolated Environment

Test compose uses separate network and volumes:

```yaml
networks:
  junction-bank-test-network: # Isolated network
volumes:
  php_test_storage: # Separate volumes
```

### Parallel Execution

Multiple test runners can run simultaneously:

```yaml
phpunit:
  profiles: [phpunit]
pest:
  profiles: [pest]
phpstan:
  profiles: [static-analysis]
```

Run with:

```bash
docker compose -f compose.test.yml --profile phpunit up
```

### Speed Optimizations

1. **tmpfs**: Database in memory
2. **Disabled fsync**: No disk writes
3. **Cached volumes**: Fast file access
4. **No logging**: Logging disabled

Result: Tests run 5-10x faster than production config.

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: |
    docker compose -f compose.yml -f compose.test.yml up \
      --abort-on-container-exit \
      --exit-code-from php

- name: Cleanup
  if: always()
  run: docker compose -f compose.yml -f compose.test.yml down -v
```

### GitLab CI Example

```yaml
test:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker compose -f compose.yml -f compose.test.yml up --abort-on-container-exit
  after_script:
    - docker compose -f compose.yml -f compose.test.yml down -v
```

## Deployment Strategies

### Blue-Green Deployment

```bash
# Start new version (green)
docker compose -f compose.yml -f compose.prod.yml up -d --scale php=4

# Verify green is healthy
sleep 30

# Scale down old version (blue)
docker compose -f compose.yml -f compose.prod.yml up -d --scale php=2

# Complete transition
docker compose -f compose.yml -f compose.prod.yml up -d
```

### Rolling Updates

Configured in compose.prod.yml:

```yaml
deploy:
  update_config:
    parallelism: 1 # Update one container at a time
    delay: 10s # Wait between updates
    order: start-first # Start new before stopping old
```

## Monitoring Hooks

### Health Endpoints

Required endpoints for monitoring:

- `/api/health` - Application health
- `/api/health/db` - Database connectivity
- `/api/health/cache` - Redis connectivity
- `/api/health/storage` - Storage writability

### Metrics Export

Expose metrics for Prometheus:

```yaml
caddy:
  ports:
    - "9090:9090" # Metrics endpoint
  command: caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
```

### Log Aggregation

All containers log to stdout in JSON format:

```json
{
  "timestamp": "2025-10-13T10:30:00Z",
  "level": "error",
  "message": "Database connection failed",
  "context": {...}
}
```

Parse with Fluentd, Logstash, or similar.

## Troubleshooting Guide

### Container Fails Health Check

```bash
# Check health status
docker compose ps

# View health logs
docker inspect --format='{{json .State.Health}}' junction-bank-php

# Test manually
docker compose exec php php-fpm -t
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Profile PHP
docker compose exec php php artisan debugbar:enable

# Analyze queries
docker compose exec postgres pg_stat_statements
```

### Network Issues

```bash
# Test connectivity
docker compose exec php ping postgres

# Inspect network
docker network inspect junction-bank-network

# Check DNS
docker compose exec php nslookup postgres
```

## Future Enhancements

1. **Kubernetes Migration**: Compose compatible with Kompose
2. **Service Mesh**: Istio/Linkerd integration hooks
3. **Observability**: OpenTelemetry instrumentation
4. **Secrets Management**: Vault/AWS Secrets Manager integration
5. **Auto-scaling**: Docker Swarm or K8s HPA configuration
