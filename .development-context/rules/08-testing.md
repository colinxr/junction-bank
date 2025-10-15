### Rule: Testing Standards

**Comprehensive Guide**: See [Testing Best Practices Guide](../guides/testing-best-practices.md) for detailed standards and examples.

**Quick Reference**:

-   **PHP**: Use PEST with `describe()` and `it()` syntax
-   **TypeScript**: Use Vitest with colocated `*.test.ts` files
-   **Coverage**: Domains ≥ 85%, Repositories/API ≥ 75%
-   **Models**: Always use factories, never manual instantiation
-   **Assertions**: Use chained `expect()` with `and()` for readability

**Key Constraints**:

-   Mock external services; no real network calls in unit tests
-   Use factories for all test data creation
-   Write descriptive test names that explain behavior
-   Follow AAA pattern (Arrange, Act, Assert)
