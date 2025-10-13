# PRD-004: Development Environment Tools

**Priority:** P1 - High
**Owner:** DevOps Team
**Timeline:** Week 1

## Requirements

-   Local development tooling
-   Debugging capabilities
-   Database management interfaces
-   Email testing environment
-   Asset compilation setup

## Acceptance Criteria

-   [x] Adminer for database management (port 8080)
-   [x] Redis Commander for cache inspection (port 8081)
-   [x] Xdebug configuration for step debugging
-   [x] Node.js container for asset compilation
-   [x] Hot reload for development
-   [x] phpstan for static analysis
-   [x] laravel pint for style

## Technical Specifications

-   Adminer PostgreSQL connection
-   Redis Commander with Redis connection
-   Xdebug on port 9003
-   Vite dev server on port 5173
