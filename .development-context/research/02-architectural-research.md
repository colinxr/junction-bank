## Architectural Research

### Scope
- Repository survey of tools, frameworks, design patterns, data models, API routing, validation, error handling, caching, background services, and testing. Notes on deviations and forward recommendations.

## Tools and Frameworks
- **Runtime/Framework**: Next.js (^15.4.6) with App Router (`app/api/*`), React 18, TypeScript ^5
- **Auth**: Clerk (`@clerk/nextjs`) via `middleware.ts` protecting routes and injecting `x-user-id`
- **ORM/DB**: Prisma (^6.5.0 CLI, @prisma/client ^5.7.1) targeting PostgreSQL; Prisma schema in `prisma/schema.prisma`
- **Caching**: Redis-compatible Valkey, client via `redis` package; docker-compose service `valkey`
- **Styling/UI**: Tailwind CSS (^4.0.0), shadcn/ui patterns, Radix UI components, lucide-react icons
- **Forms/Validation**: react-hook-form + zod (+ @hookform/resolvers), used broadly in client forms
- **HTTP**: NextResponse, SWR for client fetching, axios present
- **CSV/Uploads**: formidable for file uploads, csv-parse/papaparse for parsing
- **Testing**: Vitest (^3.1.1) with coverage, Testing Library for React, pg-mem available for DB-mocking
- **Misc**: decimal.js, uuid, dotenv-cli, vite-tsconfig-paths

## Architecture and Design Patterns
- **Clean Architecture layering (Domain-centric)**
  - Domain Entities and Exceptions live in `domains/*`
  - Application Use Cases named “Actions” in `domains/*/Actions/*`
  - Repository interfaces and concrete implementations under `domains/*/Repositories`
  - Adapters/Mappers convert between API DTOs, domain, and persistence (`domains/*/Adapters/*`)
  - Validators and explicit TypeScript types for domain inputs (`domains/*/Validators/*`)
- **Dependency Injection (composition root)**
  - `infrastructure/container.ts` wires Prisma, Redis, repositories, and actions
  - API routes resolve all use cases via factory functions: `make*Actions()`
  - No `new` of repositories/actions inside handlers per rule `03-dependency-injection.md`
- **API Route pattern** (per `.development-context/rules/04-api-routes-delegate-to-actions.md`)
  - Handler flow: auth check (middleware) → parse/validate → call one Action → map to DTO → standardized error response
  - Example: `app/api/categories/route.ts`, `app/api/transactions/route.ts`, `app/api/transactions/import/*`
- **Error Handling**
  - Central utility `infrastructure/api-error-handler.ts` following `.development-context/rules/15-error-handling-and-exceptions.md`
  - Domain throws typed exceptions extending `domains/Shared/DomainException`
  - HTTP mapping: Domain 400, Validation 400/422, Unauthorized 401, Not Found 404, Unexpected 500
- **DTOs and Mappers**
  - `domains/Transactions/Adapters/TransactionMapper.ts` converts Prisma → Domain and Domain → Persistence/DTO
  - Clear rules for enum, Decimal, and nullable conversions
- **Caching Strategy**
  - `infrastructure/redis.ts` exports a resilient client with graceful fallback (noop when down)
  - Repositories leverage cache keys and invalidation (`MonthRepository`, `TransactionRepository`)
- **Currency Integration**
  - `domains/Currency/Service/ExchangeRateApiService.ts` calls external API with in-memory TTL caching and fallback rate
  - Use cases `GetUsdToCadRate`, `ConvertUsdToCad`; `CurrencyService` normalizes input amounts
- **File Uploads / Import Pipeline**
  - `infrastructure/middleware/uploadMiddleware.ts` parses multipart via formidable
  - `TransactionImportService` orchestrates CSV parsing, validation, and batch storage
  - API endpoints: `app/api/transactions/import/preview`, `app/api/transactions/import`

## Data Models (Prisma)
- Location: `prisma/schema.prisma`
- **Category**: id, name (unique), type, notes, createdAt, isRecurring; relations to `Transaction` and `RecurringTransaction`
- **Month**: id, month, year, notes, createdAt, totals (Decimal), transactionCount; unique(month, year)
- **Transaction**: id, clerkId, monthId, name, amountCAD (Decimal, required), amountUSD (Decimal, optional), categoryId, notes, date, type(enum), createdAt; relations to `Month` and `Category`
- **RecurringTransaction**: id, clerkId, name, amountCAD/amountUSD, categoryId, notes, dayOfMonth, createdAt, type(enum)
- **TransactionType enum**: Income | Expense

Domain-side core type `CoreTransaction` aligns with DB semantics while ensuring internal types are precise (e.g., `date: Date`, `amountUSD: number | null`). Mapping ensures explicit null/undefined semantics at boundaries.

## API Design
- **Routing**: Next.js App Router under `app/api/*` using exported HTTP verb handlers
- **Auth**: `middleware.ts` with Clerk; protects non-public routes and injects `x-user-id` for API consumption
- **Error responses**: Uniform shape `{ error: { code, message } }` via `ApiErrorHandler`
- **DTO discipline**: Routes return DTOs, not Entities; mapping via `*Mapper` classes
- **Versioning**: No explicit versioning (`/api/v1`) presently
- **Caching headers**: Example `Cache-Control: no-store` on categories `GET`

## Validation
- **Client-side**: zod schemas with react-hook-form resolvers (e.g., NewTransactionForm, NewRecurringTransactionForm, NewMonthForm)
- **Server-side**: Validation predominantly via domain types/validators and action-level checks; API routes use `ApiErrorHandler.validationError()` for boundary failures

## Testing
- Vitest test coverage enabled; example tests for `ApiErrorHandler` and `ExchangeRateApiService`
- `pg-mem` present to support repository testing

## Infrastructure
- **compose.yml**: services for Next.js, Valkey, Postgres; healthchecks and environment wiring
- **Environment**: `NEXT_PUBLIC_REDIS_URL` for server Redis client; database URLs referenced as `NEXT_PUBLIC_DATABASE_URL` and `NEXT_PUBLIC_DIRECT_URL` in Prisma schema

## Observations: Deviations and Risks
- **Env var naming for server secrets**
  - Prisma `datasource` uses `NEXT_PUBLIC_DATABASE_URL`/`NEXT_PUBLIC_DIRECT_URL`. Conventionally use non-public names (`DATABASE_URL`, `DIRECT_URL`) to avoid accidental exposure or client bundling. Risk of misuse in client if imported.
- **ESLint config vs Next.js version**
  - `eslint-config-next` is 14.0.4 while `next` is ^15.4.6. Potential rule mismatches; upgrade config to match Next 15.
- **Redis wrapper typing**
  - `RedisClient` interface in `infrastructure/redis.ts` defines `get`/`del` but code also uses `set`. Interface and implementation diverge; align interface to actual usage.
- **Logging in domain/infrastructure**
  - Console statements in repositories and infra code (`console.log(cacheKey)`, `console.log(result)`, upload/import logging). Consider structured logging with levels and removal in production builds.
- **Validation status codes**
  - `ApiErrorHandler.validationError()` returns 400. Rule 15 allows 400 or 422. Current mix: typed ValidationException → 422; manual validation errors → 400. Decide canonical choice and apply consistently.
- **MonthRepository caching disabled**
  - Commented-out cache read in `findByDate` reduces cache hit benefits while still writing to cache. Either re-enable with safeguards or remove to avoid confusion.
- **Mixed DB dependencies**
  - `sqlite3` listed in dependencies although schema uses PostgreSQL. Clarify intent or remove if unused.
- **API versioning**
  - No versioning; recommend introducing `/api/v1` to enable evolvability and deprecation.

## Recommendations
- **Rename env vars**: Switch Prisma datasource to `DATABASE_URL` and `DIRECT_URL`; keep public vars only for client-side needs. Update compose/env and deployment accordingly.
- **Align linting**: Upgrade `eslint-config-next` to match Next 15 and run autofixes; ensure rules for App Router patterns are active.
- **Unify validation semantics**: Choose 422 for syntactic/semantic input validation failures; reserve 400 for broader client errors. Update `validationError()` to 422 if adopting that standard.
- **Restore/standardize caching**: Re-enable safe cache reads in repositories with try/catch and TTLs; remove verbose logs. Ensure `infrastructure/redis.ts` interface includes `set` and is used consistently.
- **Reduce console noise**: Replace ad-hoc logs with a minimal logger abstraction and level gating.
- **Introduce API versioning**: Move routes under `/api/v1` via directory nesting; support transitional aliases.
- **Harden import pipeline**: Enforce file size/type limits in upload middleware; document CSV schema and error reporting contract.
- **Add repository tests**: Use `pg-mem` to exercise repositories and caching behavior; add integration tests for `ApiErrorHandler` in routes.

## Older vs Newer Patterns
- **Newer pattern**: Clean Architecture with DI via `infrastructure/container.ts`, centralized `ApiErrorHandler`, DTO-only responses, repository interfaces with caching, currency service abstraction with tests, strong adapters/mappers for type safety, and zod on forms.
- **Older pattern**: Ad-hoc logging and partially disabled caching branches; non-versioned APIs; environment variables misnamed with `NEXT_PUBLIC_*` for server-only concerns; some API handlers still include placeholder code and direct `console.log` calls.

## References
- Clean Architecture (R. Martin)
- Next.js App Router routing conventions
- Prisma datasource environment variables best practices
- RFC 4918/HTTP semantics for 400 vs 422
