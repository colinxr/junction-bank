### Rule: Domain-Driven Design (DDD)

- The `domains/` directory owns business logic. It contains Entities, Actions (use cases), Repositories (interfaces + implementations), Mappers, DTOs, and Exceptions.
- Domain code is framework-agnostic. No imports from React, Next.js, Prisma, or UI libraries inside `domains/**`.
- Actions orchestrate use cases and depend on repository interfaces, not concrete implementations.
- API routes and UI never embed business rules. They invoke Actions and return DTOs.
- Exceptions raised in the domain extend `domains/Shared/DomainException.ts`.

Scope alignment
- Entities: encapsulate invariants and validation.
- Actions: single responsibility per file (Index, Show, Store, Update, Delete, etc.).
- DTOs: explicit data contracts crossing boundaries. Do not expose domain entities.
- Mappers: sole place for conversions between Entities, Models, and DTOs.

Non-negotiables
- No direct database access in Actions or Entities.
- No cross-domain coupling; share only via DTOs or value objects in `domains/Shared/`.

