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