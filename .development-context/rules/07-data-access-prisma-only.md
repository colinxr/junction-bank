### Rule: Data Access via Prisma Only (Inside Repositories)

- Prisma client lives in `infrastructure/prisma.ts`.
- Only repository implementations may call Prisma.

Constraints
- No direct SQL in Actions or API routes.
- Transactions/queries must be encapsulated and unit-tested at the repository level.

