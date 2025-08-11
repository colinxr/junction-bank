### Rule: Dependency Injection

- Use `infrastructure/container.ts` to wire repositories and actions.
- API routes resolve Actions via the container; avoid `new` inside handlers.
- Pass configuration (for example, clients, environment) through the container, not via global singletons.

Constraints
- No circular dependencies in the container.
- Container composition must be side-effect free and synchronous.

