### Rule: Authentication Standard

- Standardize on Clerk for auth (`@clerk/nextjs`). Use the existing middleware and helpers in `middleware.ts` and `infrastructure/auth*.ts`.
- No Supabase auth usage. Do not introduce or reference Supabase for authentication.
- Protected routes must enforce auth via middleware and `components/auth/protected-route.tsx`.

Constraints
- No auth logic in domain code.
- Do not couple Actions to user session libraries; pass user identifiers as primitives.

