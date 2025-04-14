# Domain Layer

The domain layer is the innermost layer of the Clean Architecture. It contains the business logic, entities, and rules that are independent of any external frameworks or concerns.

## Components:

### Entities
- `Category.ts`: The core entity in the categories feature. It contains validation logic and business rules related to categories.

### Repository Interfaces
- `ICategoryRepository.ts`: The interface that defines the methods needed to interact with category data. This is implemented by the infrastructure layer.

### Exceptions
- `DomainException.ts`: Base exception class for all domain-related errors.
- `CategoryException.ts`: Specific exception classes for category-related business rule violations.

## Responsibilities:

- Define the core entities and data structures
- Enforce business rules and validation logic
- Define interfaces for data access
- Be completely independent of frameworks or external concerns

This layer should not depend on any other layer and should not contain any imports from other layers. 

# Application Layer

The application layer sits between the domain and infrastructure layers. It orchestrates the flow of data between the outer layers and the domain, and implements use cases that define the application's behavior.

## Components:

### DTOs (Data Transfer Objects)
- `CategoryDTO.ts`: Defines the data structures for communication between layers without exposing domain entities.

### Use Cases
- `GetCategoriesUseCase.ts`: Retrieves all categories
- `GetCategoryUseCase.ts`: Retrieves a single category by ID
- `CreateCategoryUseCase.ts`: Creates a new category
- `DeleteCategoryUseCase.ts`: Deletes a category

## Responsibilities:

- Implement specific use cases for the application
- Coordinate between domain entities and external interfaces
- Handle application-specific validation logic
- Convert between domain entities and DTOs
- Orchestrate complex operations involving multiple entities or repositories

The application layer depends on the domain layer but should be independent of the infrastructure and interface layers. It should not contain any framework-specific code or direct database access. 

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