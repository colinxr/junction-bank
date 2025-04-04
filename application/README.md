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