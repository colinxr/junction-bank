### Rule: Repository Pattern

- All data access goes through repository interfaces defined per domain (for example, `domains/Categories/ICategoryRepository.ts`).
- Concrete implementations (for example, `CategoryRepository.ts`) live alongside the domain and may use Prisma.
- Actions depend only on interfaces, injected via the container.
- Repositories return domain Entities or Value Objects; API routes must not call repositories directly.

Constraints
- No direct Prisma usage outside repository implementations.
- No external API calls from Actions; encapsulate integrations in repositories or services.

