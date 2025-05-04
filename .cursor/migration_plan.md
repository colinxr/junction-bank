
<brainstorming>
1.  **Goal:** Migrate database interactions from Supabase DB to local Docker PostgreSQL while keeping Supabase Authentication.
2.  **Key Components:**
    *   `compose.yml`: Defines services (Next.js, Postgres, Valkey). Needs environment variables for Next.js, including `DATABASE_URL` and Supabase keys.
    *   `docker-compose.override.yml`: Exposes ports locally.
    *   `infrastructure/supabase/`: Contains client, middleware, and server helpers for Supabase. These need to be preserved for auth but purged of DB operations outside auth contexts.
    *   `infrastructure/prisma.ts`: Existing Prisma client setup. This will be the primary tool for DB interaction.
    *   `prisma/schema.prisma`: Defines the database schema. Needs to be configured for PostgreSQL and applied to the local DB.
    *   API Routes (`app/api/` or `pages/api/`): Likely contain Supabase DB calls that need replacement with Prisma calls (e.g., for transactions, categories). Auth routes will keep Supabase auth calls.
    *   Middleware (`middleware.ts`): Uses `infrastructure/supabase/middleware.ts` for auth checks. Should remain unchanged regarding auth.
    *   Client-side code (`infrastructure/api-client.ts`): Uses Supabase browser client for getting auth tokens. Should remain unchanged.
3.  **Migration Strategy:**
    *   **Configure:** Set up environment variables and Prisma connection.
    *   **Schema:** Apply the Prisma schema to the local database.
    *   **Refactor (Core Logic):** Identify and replace Supabase DB calls with Prisma calls in API routes and potentially server components/data fetching functions. Focus on non-auth data operations.
    *   **Verify Auth:** Ensure the Supabase auth parts remain functional.
    *   **Testing:** Update/add tests.
    *   **Data Migration:** Instruct user.
4.  **Plan Structure:** Follow the requested markdown format, breaking down the strategy into atomic steps suitable for an AI code generator. Ensure dependencies are clear.

</brainstorming>

# Implementation Plan

## Phase 1: Configuration & Schema Setup

-   [ ] Step 1: Configure Next.js Service Environment Variables
    -   **Task**: Update `compose.yml` to pass necessary environment variables to the `nextjs` service. This includes Supabase keys for auth and the `DATABASE_URL` for Prisma, constructed from the Postgres service variables. Create a `.env` file for local credentials.
    -   **Files**:
        -   `compose.yml`: Add `env_file` directive or `environment` block to `nextjs` service.
        -   `.env` (New File): Define `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Construct `DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"`.
    -   **Step Dependencies**: None.
    -   **User Instructions**: Create the `.env` file in the project root with your specific Supabase keys and chosen PostgreSQL credentials. Ensure the Postgres credentials match those used *inside* the `compose.yml` `postgres` service definition if you changed them from the defaults (`myappdb`, `myappuser`, `myapppassword`).

-   [ ] Step 2: Configure Prisma Datasource for PostgreSQL
    -   **Task**: Update the `prisma/schema.prisma` file to ensure the `datasource db` block points to PostgreSQL and uses the `DATABASE_URL` environment variable.
    -   **Files**:
        -   `prisma/schema.prisma`: Modify the `datasource db` block's `provider` to `postgresql` and ensure `url = env("DATABASE_URL")`.
    -   **Step Dependencies**: Step 1.
    -   **User Instructions**: Review the rest of your `prisma/schema.prisma` file to ensure the models and field types are compatible with PostgreSQL if migrating from a different Prisma provider previously.

-   [ ] Step 3: Apply Prisma Schema to Local PostgreSQL Database
    -   **Task**: This step involves user action to initialize the local database schema using Prisma.
    -   **Files**: None (User action only).
    -   **Step Dependencies**: Step 1, Step 2.
    -   **User Instructions**:
        1.  Ensure Docker Desktop is running.
        2.  Run `docker compose up -d postgres` in your terminal from the project root to start the database service.
        3.  Run `npx prisma db push` (if you don't need migration history) or `npx prisma migrate dev --name init-local-postgres` (to create a migration file) to apply your schema to the running PostgreSQL container. Verify the command completes successfully.

## Phase 2: Refactoring Database Operations

-   [ ] Step 4: Refactor Transaction CRUD Operations to Prisma
    -   **Task**: Identify API routes responsible for transaction management (e.g., create, read, update, delete). Replace any Supabase client database calls (`.from('transactions')...`) with equivalent Prisma client calls (`prisma.transaction...`). Import the prisma client where needed.
    -   **Files**:
        -   `app/api/transactions/[...]/route.ts` (or `pages/api/transactions/*.ts`): Modify files handling transaction CRUD to use `import { prisma } from '@/infrastructure/prisma';` and replace Supabase DB calls. *Note: Specific file paths depend on your project structure.*
    -   **Step Dependencies**: Step 3.
    -   **User Instructions**: Verify the logic accurately translates Supabase queries to Prisma queries.

-   [ ] Step 5: Refactor Category CRUD Operations to Prisma
    -   **Task**: Identify API routes responsible for category management. Replace any Supabase client database calls (`.from('categories')...`) with equivalent Prisma client calls (`prisma.category...`).
    -   **Files**:
        -   `app/api/categories/[...]/route.ts` (or `pages/api/categories/*.ts`): Modify files handling category CRUD to use Prisma.
    -   **Step Dependencies**: Step 3.
    -   **User Instructions**: Ensure Prisma client is imported and used correctly.

-   [ ] Step 6: Refactor Monthly Template Operations to Prisma
    -   **Task**: Identify API routes or server actions related to monthly templates or recurring transactions. Replace any Supabase client database calls with equivalent Prisma client calls.
    -   **Files**:
        -   `app/api/monthly-template/[...]/route.ts` (or relevant files): Modify files handling monthly template logic to use Prisma.
        -   `scripts/recalculateRecurringExpenses.ts` (if it uses Supabase DB): Modify script to use Prisma.
    -   **Step Dependencies**: Step 3.
    -   **User Instructions**: Check any scripts or less common routes that might interact with template/recurring data.

-   [ ] Step 7: Review Server Components/Data Fetching for Supabase DB Calls
    -   **Task**: Search server components, `getServerSideProps`, or other server-side data fetching functions for direct Supabase database calls (excluding `auth` calls). Replace any found with Prisma client calls.
    -   **Files**:
        -   Potentially various files under `app/` or `pages/`. Perform a codebase search for `.from(`, `.select(`, `.insert(`, `.update(`, `.delete(`, `.rpc(` used with the Supabase client variable *outside* of auth contexts/files.
    -   **Step Dependencies**: Step 3.
    -   **User Instructions**: Carefully review search results to distinguish between necessary Supabase auth calls and database calls that need migration to Prisma.

## Phase 3: Verification and Data Migration

-   [ ] Step 8: Verify Authentication Flow Integrity
    -   **Task**: Manually test the login, registration, and logout flows. Check protected routes and middleware behavior to ensure Supabase authentication remains fully functional.
    -   **Files**: None (Testing only).
    -   **Step Dependencies**: Step 1, All refactoring steps (4-7).
    -   **User Instructions**: Perform standard user authentication flows (login, logout, accessing protected/public pages) to confirm no regressions were introduced. Review `middleware.ts`, `infrastructure/supabase/middleware.ts`, `infrastructure/supabase/server.ts`, and auth API routes if issues arise.

-   [ ] Step 9: Update/Add Database Interaction Tests
    -   **Task**: Review existing tests (unit, integration, e2e). Update tests that previously mocked or interacted with Supabase DB to now mock or interact with Prisma and the local PostgreSQL database. Add tests for Prisma interactions if coverage is lacking.
    -   **Files**:
        -   Test files (e.g., `*.test.ts`, `*.spec.ts`): Update tests related to data fetching/mutation.
    -   **Step Dependencies**: All refactoring steps (4-7).
    -   **User Instructions**: Ensure your test environment correctly connects to a test database (either the same local Postgres or a separate one) using the `DATABASE_URL`. Update testing libraries or mocks as needed (e.g., using `prisma-mock` or similar if appropriate).

-   [ ] Step 10: Data Migration Guidance
    -   **Task**: Provide instructions for the user on how to migrate existing data from their Supabase database to the local PostgreSQL database.
    -   **Files**: None (Documentation/Instructions).
    -   **Step Dependencies**: Step 3.
    -   **User Instructions**:
        1.  **Export from Supabase:** Use the Supabase dashboard (Storage -> Backups or SQL Editor -> Export Schema/Data) or `pg_dump` CLI tool connected to your Supabase instance to export your data (e.g., as CSV or SQL).
        2.  **Import to Local Postgres:**
            *   **SQL:** Use `psql` or a GUI tool (like DBeaver, pgAdmin) connected to your local Docker Postgres (Host: `localhost`, Port: `5432`, User/Pass/DB from `.env`). Run the exported SQL file.
            *   **CSV:** Use `COPY` command in `psql` or the import feature of a GUI tool.
        3.  **Consider Dependencies:** Import data in an order that respects foreign key constraints (e.g., `users`, `categories` before `transactions`).

# Summary

This plan outlines the migration of the application's database layer from Supabase's hosted database to a local PostgreSQL instance managed by Docker Compose, while retaining Supabase for user authentication. The key steps involve:

1.  Configuring the Next.js application and Prisma to connect to the local PostgreSQL database using environment variables.
2.  Applying the existing Prisma schema to the local database.
3.  Systematically refactoring API routes and server-side logic to replace Supabase database query calls with their Prisma equivalents.
4.  Verifying that the authentication system (which remains on Supabase) is unaffected.
5.  Updating tests and providing instructions for manual data migration.

This approach leverages the existing Prisma setup and focuses changes primarily on the data access logic within API routes and potentially server components, leaving the core authentication mechanisms intact.