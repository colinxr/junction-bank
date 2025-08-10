# Architectural Research Document

This document details the tools, frameworks, and design patterns used in the Junction Bank application. It highlights architectural decisions, deviations from best practices, and provides recommendations for improvement.

## 1. Tools & Frameworks

The application is built on a modern TypeScript stack.

-   **Core Framework**: [Next.js](https://nextjs.org/) (v15) with React (v18).
-   **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/) as the ORM.
-   **Authentication**: Multiple libraries are present:
    -   [Clerk](https://clerk.com/) (`@clerk/nextjs`) appears to be the primary and intended provider, as it's used in the `middleware.ts` and referenced in the database schema.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components, which uses Radix UI primitives.
-   **API Layer**: Next.js API Routes.
-   **Data Fetching (Client)**: [SWR](https://swr.vercel.app/) for client-side data fetching and caching.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for schema validation.
-   **File Processing**: `papaparse` and `formidable` for handling CSV imports.
-   **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.

## 2. Design Patterns & Architecture

The application follows several established design patterns, though not always consistently.

-   **Domain-Driven Design (DDD)**: The backend is structured around DDD principles. The `domains/` directory contains business logic encapsulated in entities, actions (use cases), repositories, and mappers. API routes delegate calls to these domain actions, keeping business logic isolated from the transport layer. This is a strong architectural choice that promotes maintainability and scalability.
-   **Repository Pattern**: The use of `IRepository` interfaces and `Repository` implementations (e.g., `ICategoryRepository`, `CategoryRepository`) abstracts data access from the domain logic, allowing for easier testing and potential swapping of data sources.
-   **Dependency Injection**: A simple form of dependency injection is used via the `infrastructure/container.ts` file, which composes and injects dependencies (like repositories) into the domain actions.
-   **API Design**: The API follows a standard RESTful approach using Next.js API Routes. It correctly uses DTOs (Data Transfer Objects) via Mappers to decouple the API response structure from the internal domain models.

## 3. Architectural Conflicts & Deviations

Several architectural conflicts and deviations from best practices were identified.

### 3.1. Inconsistent API Authorization

While `middleware.ts` uses Clerk for authorization, some older API routes may rely on custom JWT validation (as hinted at by `infrastructure/auth.ts`). This lack of a single, authoritative enforcement point is a potential security gap.

## 4. Recommendations
1.  **Enforce Consistent DDD Pattern**:
    -   **Action**: Audit all API routes to ensure they delegate business logic to domain actions and do not contain raw Prisma calls or business logic. The `categories` route is a good example to follow.
    -   **Rationale**: Strict adherence to the DDD pattern will maintain a clean separation of concerns, making the application easier to test, maintain, and reason about.
    -   **Reference**: [Martin Fowler: Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

2.  **Refactor Client-Side Data Fetching**:
    -   **Action**: Create a centralized API client or typed hooks for `swr` that align with the backend DTOs. This will provide type safety for API responses and reduce boilerplate in components.
    -   **Rationale**: A typed API layer on the frontend prevents common errors and improves the developer experience.
