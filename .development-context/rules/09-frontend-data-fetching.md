### Rule: Frontend Data Fetching

- Use SWR for client-side fetching and caching.
- Expose typed hooks in `app/hooks/**` that wrap the API client (see `infrastructure/api-client.ts`).
- UI components consume hooks; they do not call `fetch` directly.

Constraints
- Hooks return DTO-shaped data and typed mutators.
- Centralize endpoints and keys to avoid duplication.

