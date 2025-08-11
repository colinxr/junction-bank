### Rule: API Routes Delegate to Actions

- Handlers perform: auth check → input validation → call one Action → map result/exception to HTTP.
- No business logic in handlers. No direct repository or Prisma usage.
- Handlers return DTOs only; never return Entities.

**Error Handling**
- Use `ApiErrorHandler` utility for all error responses (see Rule 15).
- Validation/domain errors → 400/422 with `{ error: { code, message } }`.
- Not found → 404.
- Unexpected → 500; do not leak internals.
- Never implement custom error handling - always use ApiErrorHandler methods.

