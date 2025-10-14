# Documentation

Comprehensive documentation for Junction Bank development, deployment, and maintenance.

## Quick Start

-   **[README.md](../README.md)** - Project overview and quick setup
-   **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Development workflow and contribution guidelines

## API Documentation

-   **[API.md](API.md)** - Complete API documentation with examples
-   **[openapi.yaml](openapi.yaml)** - OpenAPI 3.0 specification for automated tools

### Using the API Documentation

**Swagger UI:**

```bash
npx swagger-ui-serve docs/openapi.yaml
```

**Import to Postman:**

1. Open Postman
2. Import → openapi.yaml
3. Auto-generated collection ready

**Generate Client:**

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-fetch \
  -o generated/api-client
```

## Development Guides

### Essential Reading

-   **[BEST_PRACTICES.md](BEST_PRACTICES.md)** - Coding standards, patterns, and workflows
-   **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

### Deep Dives

-   **[docker/README.md](../docker/README.md)** - Docker architecture and configuration
-   **[.development-context/rules/](../.development-context/rules/)** - Detailed coding rules
-   **[.development-context/ADRs/](../.development-context/ADRs/)** - Architecture decisions

## Architecture Documentation

### Architecture Decision Records (ADRs)

Key decisions documented in `.development-context/ADRs/`:

-   **[ADR-001: Docker Infrastructure](../.development-context/ADRs/001-docker-laravel-infrastructure.md)**

    -   Multi-environment Docker setup
    -   Service architecture
    -   Development/production optimization

-   **[ADR-002: Domain-Driven Design](../.development-context/ADRs/002-domain-driven-design-approach.md)**

    -   DDD principles and structure
    -   Layer responsibilities
    -   Implementation guidelines

-   **[ADR-003: Laravel Sanctum Authentication](../.development-context/ADRs/003-laravel-sanctum-authentication.md)**

    -   Authentication strategy
    -   Token management
    -   Security considerations

-   **[ADR-094: Transaction Type System](../.development-context/ADRs/94-transaction-type-system.md)**
    -   Type design decisions
    -   Business rule implications

### Domain Documentation

Detailed domain logic in `.development-context/`:

-   **api-endpoints-reference.md** - Complete endpoint reference
-   **backend-analysis-report.md** - Backend architecture analysis
-   **frontend-analysis-report.md** - Frontend architecture analysis
-   **migration-checklist.md** - Next.js → Laravel migration guide

## Quick Reference

### Common Commands

```bash
# Development
just dev              # Start environment
just dev-stop         # Stop environment
just dev-logs         # View logs

# Database
just migrate          # Run migrations
just migrate-fresh    # Reset database
just seed             # Run seeders
just db-backup        # Backup database

# Code Quality
just phpstan          # Static analysis
just pint             # Fix code style
just test             # Run tests
just quality          # All checks

# Application
just artisan [cmd]    # Artisan commands
just composer [cmd]   # Composer commands
just ssh              # SSH into PHP container
```

Full command reference: `just --list`

### Development URLs

| Service         | URL                   | Purpose       |
| --------------- | --------------------- | ------------- |
| Application     | http://localhost:8000 | Laravel API   |
| Next.js         | http://localhost:3000 | Frontend      |
| Adminer         | http://localhost:8080 | Database UI   |
| MailHog         | http://localhost:8025 | Email testing |
| Redis Commander | http://localhost:8081 | Redis UI      |
| Vite            | http://localhost:5173 | Hot reload    |

### Directory Structure

```
junction-bank/
├── docs/                         # This directory
│   ├── API.md                    # API guide
│   ├── openapi.yaml              # OpenAPI spec
│   ├── BEST_PRACTICES.md         # Coding standards
│   └── TROUBLESHOOTING.md        # Problem solving
├── .development-context/         # Architecture docs
│   ├── ADRs/                     # Decision records
│   ├── PRDs/                     # Product requirements
│   └── rules/                    # Coding rules
├── app/                          # Laravel application
│   └── Domains/                  # DDD domains
├── docker/                       # Docker configuration
├── next-js-app/                  # Frontend application
└── tests/                        # Test suite
```

## For New Developers

### First Day Checklist

1. **Setup Development Environment**

    ```bash
    git clone <repository>
    cd junction-bank
    just setup
    ```

2. **Read Core Documentation**

    - [README.md](../README.md)
    - [CONTRIBUTING.md](../CONTRIBUTING.md)
    - [BEST_PRACTICES.md](BEST_PRACTICES.md)

3. **Understand Architecture**

    - [ADR-002: Domain-Driven Design](../.development-context/ADRs/002-domain-driven-design-approach.md)
    - [Development Rules](../.development-context/rules/)

4. **Explore Codebase**

    - Review one domain: `app/Domains/Categories/`
    - Understand layer separation
    - Read tests: `tests/Unit/Domains/Categories/`

5. **Make First Change**
    - Create branch: `git checkout -b feature/my-first-change`
    - Make small change
    - Run quality checks: `just quality`
    - Run tests: `just test`
    - Create pull request

### Learning Path

**Week 1: Environment & Basics**

-   Setup development environment
-   Understand Docker architecture
-   Learn Laravel basics
-   Explore existing domains

**Week 2: Domain-Driven Design**

-   Study DDD principles
-   Understand layer responsibilities
-   Review repository pattern
-   Practice with small features

**Week 3: Testing & Quality**

-   Write unit tests
-   Write feature tests
-   Use PHPStan
-   Follow code style

**Week 4: Full Features**

-   Implement complete features
-   Follow contribution workflow
-   Participate in code reviews
-   Document changes

## For Experienced Developers

### Key Differences

If coming from:

**Traditional Laravel MVC:**

-   Controllers delegate to Actions (not direct model calls)
-   Repository pattern abstracts data access
-   DTOs transfer data between layers
-   Strict domain boundaries

**Next.js/Node:**

-   PHP 8.3 with strict types
-   Eloquent ORM (not Prisma)
-   Laravel conventions
-   Synchronous by default (queue for async)

**Other DDD Implementations:**

-   Laravel-flavored DDD (pragmatic, not pure)
-   Use Eloquent models (not pure entities)
-   Repository interfaces with Eloquent implementations

### Advanced Topics

-   **Performance Optimization:** Cache strategies, query optimization
-   **Security:** Sanctum authentication, authorization policies
-   **Testing:** Unit, feature, and architecture tests
-   **Deployment:** Production Docker configuration

## Support & Resources

### Getting Help

1. **Check Documentation**

    - This directory (`docs/`)
    - `.development-context/` directory
    - Inline code comments

2. **Search Issues**

    - Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
    - Review closed issues
    - Search error messages

3. **Run Diagnostics**

    ```bash
    just health
    just dev-logs
    just phpstan
    ```

4. **Ask Team**
    - Development team
    - Code review feedback
    - Pair programming sessions

### External Resources

-   [Laravel Documentation](https://laravel.com/docs)
-   [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
-   [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
-   [Laravel Beyond CRUD](https://laravel-beyond-crud.com/)

## Contributing to Documentation

### When to Update

-   Adding new features
-   Changing architecture
-   Fixing documentation bugs
-   Improving clarity

### How to Update

1. Edit appropriate file in `docs/` or `.development-context/`
2. Keep examples current
3. Use clear language
4. Test code examples
5. Update table of contents if needed

### Documentation Standards

-   Use markdown for all docs
-   Include code examples
-   Use mermaid for diagrams
-   Keep files focused and scannable
-   Link related documents

## Document Index

### Getting Started

-   [README.md](../README.md) - Project overview
-   [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute

### Development

-   [BEST_PRACTICES.md](BEST_PRACTICES.md) - Coding standards
-   [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving
-   [docker/README.md](../docker/README.md) - Docker guide

### API

-   [API.md](API.md) - API documentation
-   [openapi.yaml](openapi.yaml) - OpenAPI specification
-   [api-endpoints-reference.md](../.development-context/api-endpoints-reference.md) - Endpoint details

### Architecture

-   [ADRs](../.development-context/ADRs/) - Architecture decisions
-   [rules](../.development-context/rules/) - Coding rules
-   [PRDs](../.development-context/PRDs/) - Product requirements

## Maintenance

This documentation is maintained by the development team. Last updated: 2024-10-14.

**Review Schedule:**

-   Weekly: Update for new features
-   Monthly: Review for accuracy
-   Quarterly: Major revision and cleanup
