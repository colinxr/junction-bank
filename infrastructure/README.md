# Infrastructure Layer

The infrastructure layer provides concrete implementations of interfaces defined in the domain layer. It contains code that interacts with external systems, frameworks, and databases.

## Components:

### Repositories
- `PrismaCategoryRepository.ts`: Implements the `ICategoryRepository` interface using Prisma ORM.

### Mappers
- `CategoryMapper.ts`: Provides methods to convert between domain entities, database models, and DTOs.

### Dependency Injection
- `container.ts`: Simplifies the creation and wiring of repositories and use cases.

## Responsibilities:

- Implement repository interfaces defined in the domain layer
- Interact with databases, external APIs, and other external systems
- Map between domain entities and external data formats
- Provide dependency injection mechanisms
- Manage technical concerns such as database connections, caching, etc.

The infrastructure layer depends on the domain and application layers. It should encapsulate framework-specific code to prevent it from leaking into the inner layers. 