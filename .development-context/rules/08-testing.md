### Rule: Testing Standards

- Test framework: Vitest.
- Test placement: colocate `*.test.ts` next to the implementation.
- Coverage targets: domains (entities, actions, mappers) ≥ 85% lines; repositories and API routes ≥ 75% lines.
- Write focused unit tests for invariants and exception paths; integration tests for repositories and API routes.

Constraints
- Mock external services; do not hit real networks in unit tests.
- Provide factories/builders for domain objects where needed.

