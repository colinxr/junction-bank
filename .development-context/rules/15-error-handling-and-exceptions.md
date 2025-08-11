### Rule: Error Handling and Exceptions

- Domain raises typed exceptions extending `domains/Shared/DomainException.ts`.
- API routes use `ApiErrorHandler` utility for consistent error handling.
- All error responses follow format: `{ error: { code, message } }`.
- Log unexpected errors server-side; never leak stack traces to clients.

**Implementation**
- Use `ApiErrorHandler.handle(error, defaultMessage)` for catch blocks
- Use `ApiErrorHandler.validationError(message)` for input validation failures
- Use `ApiErrorHandler.notFound(message)` for resource not found
- Use `ApiErrorHandler.unauthorized(message)` for authentication failures

**HTTP Status Code Mapping**
- Domain exceptions → 400 (Bad Request)
- Not found exceptions → 404 (Not Found)  
- Validation errors → 400 (Bad Request) or 422 (Unprocessable Entity)
- Authentication errors → 401 (Unauthorized)
- Unexpected errors → 500 (Internal Server Error)

**Constraints**
- Do not throw raw strings. Use typed errors.
- Validate inputs at boundaries; enforce invariants in entities.
- Never implement custom error handling in API routes - use ApiErrorHandler.
- All error responses must include both code and message properties.

