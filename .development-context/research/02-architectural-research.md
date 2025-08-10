# Architectural Research Document

This document details the tools, frameworks, and design patterns used in the Junction Bank application. It highlights architectural decisions, deviations from best practices, and provides recommendations for improvement.

## 1. Tools & Frameworks

The application is built on a modern TypeScript stack.

-   **Core Framework**: [Next.js](https://nextjs.org/) (v15) with React (v18).
-   **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/) as the ORM.
-   **Authentication**: Multiple libraries are present:
    -   [Clerk](https://clerk.com/) (`@clerk/nextjs`) appears to be the primary and intended provider, as it's used in the `middleware.ts` and referenced in the database schema.
    -   [Supabase](https://supabase.io/) (`@supabase/ssr`) is used in legacy API routes for login and registration.
    -   [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) is used for password hashing in a legacy registration flow.
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

### 3.1. Conflicting Authentication Systems (Critical Risk)

The most significant issue is the presence of three distinct authentication systems:

1.  **Clerk**: Used in `middleware.ts` to protect routes and in the `prisma` schema (`clerkId`). This appears to be the current, intended system.
2.  **Supabase**: Used in the `/api/auth/login` and `/api/auth/register` routes. This code authenticates against Supabase Auth.
3.  **Custom `bcrypt` Hashing**: Used alongside Supabase in the registration route to hash a password, which is then stored in a local `User` table that has since been migrated away from.

**Risks**:
-   **Security Vulnerabilities**: Managing multiple auth systems increases the attack surface. The legacy Supabase/bcrypt routes may not be maintained or secured to the same standard as the Clerk integration.
-   **Data Inconsistency**: User data is fragmented. The `register` endpoint creates a user in both Supabase and the local Prisma database (with a `bcrypt`-hashed password), but the rest of the application relies on `clerkId`. This will lead to broken data relationships and authorization failures.
-   **Maintenance Overhead**: The dead code from the Supabase and `bcrypt` implementations adds complexity and confusion for developers.

### 3.2. Inconsistent API Authorization

While `middleware.ts` uses Clerk for authorization, some older API routes may rely on custom JWT validation (as hinted at by `infrastructure/auth.ts`). This lack of a single, authoritative enforcement point is a potential security gap.

## 4. Recommendations

1.  **Consolidate Authentication to Clerk**:
    -   **Action**: Immediately remove the legacy Supabase and `bcrypt` code from the API routes (`app/api/auth/login`, `app/api/auth/register`).
    -   **Action**: Delete unused dependencies from `package.json`: `@supabase/ssr`, `bcryptjs`.
    -   **Rationale**: Clerk is already integrated at the middleware level and tied to the database schema, making it the de facto source of truth. Unifying under Clerk will eliminate security risks, resolve data consistency issues, and simplify the codebase.
    -   **Reference**: [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)

2.  **Enforce Consistent DDD Pattern**:
    -   **Action**: Audit all API routes to ensure they delegate business logic to domain actions and do not contain raw Prisma calls or business logic. The `categories` route is a good example to follow.
    -   **Rationale**: Strict adherence to the DDD pattern will maintain a clean separation of concerns, making the application easier to test, maintain, and reason about.
    -   **Reference**: [Martin Fowler: Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

3.  **Refactor Client-Side Data Fetching**:
    -   **Action**: Create a centralized API client or typed hooks for `swr` that align with the backend DTOs. This will provide type safety for API responses and reduce boilerplate in components.
    -   **Rationale**: A typed API layer on the frontend prevents common errors and improves the developer experience.
