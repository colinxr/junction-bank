# Domain Layer

The domain layer is the innermost layer of the Clean Architecture. It contains the business logic, entities, and rules that are independent of any external frameworks or concerns.

## Components:

### Entities
- **Categories**: `Category.ts` - Core entity with validation logic and business rules
- **Transactions**: `Transaction.ts` - Financial transaction entity with currency support
- **RecurringTransactions**: `RecurringTransaction.ts` - Recurring transaction patterns
- **Months**: `Month.ts` - Monthly financial period management

### Repository Interfaces
- `ICategoryRepository.ts`: Interface for category data operations
- `ITransactionRepository.ts`: Interface for transaction data operations
- `IRecurringTransactionRepository.ts`: Interface for recurring transaction operations
- `IMonthRepository.ts`: Interface for month data operations

### Exceptions
- `DomainException.ts`: Base exception class for all domain-related errors
- `CategoryException.ts`: Category-specific business rule violations
- `TransactionException.ts`: Transaction-specific business rule violations
- `RecurringTransactionException.ts`: Recurring transaction-specific violations
- `MonthException.ts`: Month-specific business rule violations

### Shared Utilities
- `cleanUpdateData.ts`: Utility function for eliminating repetitive update patterns
  - Filters out undefined values automatically
  - Applies custom transformers for complex field mappings
  - Improves code maintainability and readability

## Responsibilities:

- Define the core entities and data structures
- Enforce business rules and validation logic
- Define interfaces for data access
- Be completely independent of frameworks or external concerns

This layer should not depend on any other layer and should not contain any imports from other layers.

## Recent Refactoring

### Code Quality Improvements
The domain layer has undergone significant refactoring to improve code quality and maintainability:

- **Eliminated Repetitive Patterns**: Replaced verbose `if (data.field !== undefined)` checks with the `cleanUpdateData` utility
- **Centralized Update Logic**: Created reusable utility functions for common update operations
- **Improved Readability**: Reduced code duplication across repositories and actions
- **Maintained Type Safety**: All refactoring preserves TypeScript type safety and functionality

### Affected Domains
- **Transactions Domain**: Repository, actions, and adapters refactored
- **RecurringTransactions Domain**: Repository update method refactored
- **Shared Utilities**: New `cleanUpdateData` utility function added

All refactoring changes maintain backward compatibility and pass comprehensive test suites. 

# Application Layer

The application layer sits between the domain and infrastructure layers. It orchestrates the flow of data between the outer layers and the domain, and implements use cases that define the application's behavior.

## Components:

### DTOs (Data Transfer Objects)
- `CategoryDTO.ts`: Defines the data structures for communication between layers without exposing domain entities.

### Use Cases
- **Categories**: `GetCategoriesUseCase.ts`, `GetCategoryUseCase.ts`, `CreateCategoryUseCase.ts`, `DeleteCategoryUseCase.ts`
- **Transactions**: `StoreTransaction.ts`, `UpdateTransaction.ts`, `DeleteTransaction.ts`, `ShowTransaction.ts`, `IndexTransactions.ts`, `ImportTransactions.ts`
- **RecurringTransactions**: `StoreRecurringTransaction.ts`, `UpdateRecurringTransaction.ts`, `DeleteRecurringTransaction.ts`, `ShowRecurringTransaction.ts`, `IndexRecurringTransactions.ts`
- **Months**: `StoreMonth.ts`, `UpdateMonth.ts`, `ShowMonth.ts`, `IndexMonths.ts`, `DestroyMonth.ts`, `RecalculateRecurringExpenses.ts`

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
- `PrismaCategoryRepository.ts`: Implements the `ICategoryRepository` interface using Prisma ORM
- `TransactionRepository.ts`: Implements the `ITransactionRepository` interface with Redis caching
- `RecurringTransactionRepository.ts`: Implements the `IRecurringTransactionRepository` interface
- `MonthRepository.ts`: Implements the `IMonthRepository` interface with Redis caching

### Mappers
- `CategoryMapper.ts`: Provides methods to convert between domain entities, database models, and DTOs
- `TransactionMapper.ts`: Handles transaction entity mapping and transformation
- `RecurringTransactionMapper.ts`: Manages recurring transaction entity mapping
- `MonthMapper.ts`: Handles month entity mapping and transformation

### Dependency Injection
- `container.ts`: Simplifies the creation and wiring of repositories and use cases.

## Responsibilities:

- Implement repository interfaces defined in the domain layer
- Interact with databases, external APIs, and other external systems
- Map between domain entities and external data formats
- Provide dependency injection mechanisms
- Manage technical concerns such as database connections, caching, etc.

The infrastructure layer depends on the domain and application layers. It should encapsulate framework-specific code to prevent it from leaking into the inner layers. 