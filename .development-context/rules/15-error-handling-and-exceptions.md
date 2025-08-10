### Rule: Error Handling and Exceptions

- Domain raises typed exceptions extending `domains/Shared/DomainException.ts`.
- API routes map exceptions to HTTP status codes and return `{ error: { code, message } }`.
- Log unexpected errors server-side; never leak stack traces to clients.

Constraints
- Do not throw raw strings. Use typed errors.
- Validate inputs at boundaries; enforce invariants in entities.

