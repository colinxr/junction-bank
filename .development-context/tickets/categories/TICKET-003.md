# TICKET-003: Category Entity (Domain)

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** None  
**PRD Reference:** Lines 145-165, 553-575

## Overview

Create the core Category domain entity that encapsulates business rules and validation logic. This is the heart of the domain layer and enforces all business constraints independent of infrastructure.

## Technical Specifications

### Entity Location

`app/Domains/Categories/Entities/Category.php`

### Entity Structure

```php
namespace App\Domains\Categories\Entities;

class Category
{
    private ?int $id;
    private string $name;
    private ?string $notes;
    private ?\DateTimeInterface $createdAt;

    public function __construct(
        string $name,
        ?string $notes = null,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null
    ) {
        $this->name = $name;
        $this->notes = $notes;
        $this->id = $id;
        $this->createdAt = $createdAt;

        $this->validate();
    }

    private function validate(): void {
        // Validation logic from PRD lines 553-575
    }

    // Getters, setters, business methods
}
```

### Validation Rules (PRD Lines 553-575)

#### Name Validation

-   **Required:** Cannot be empty or null
-   **Max Length:** 255 characters
-   **Exception:** `CategoryNameEmptyException` if empty
-   **Exception:** `InvalidCategoryNameException` if > 255 chars

#### Notes Validation

-   **Optional:** Can be null
-   **Max Length:** 1000 characters if provided
-   **Exception:** `InvalidCategoryNotesException` if > 1000 chars

### Exception Classes

Create in `app/Domains/Categories/Exceptions/`

```php
// Base exception
abstract class CategoryException extends \Exception {}

// Specific exceptions
class InvalidCategoryNameException extends CategoryException {} // invalid characters + empty name.
class InvalidCategoryNotesException extends CategoryException {}
class CategoryNotFoundException extends CategoryException {}
class CategoryAlreadyExistsException extends CategoryException {}
class CategoryHasTransactionsException extends CategoryException {}
```

### Business Methods

```php
public function updateName(string $newName): void
public function updateNotes(?string $newNotes): void
```

## Implementation Tasks

1. Create entity class with private properties
2. Implement constructor with validation
3. Implement `validate()` method with all rules
4. Create all exception classes
5. Add business methods for state changes
6. Add PHPDoc annotations
7. Write comprehensive unit tests
8. update the category db table to remove any refernces to recurring and type. these columns are not needed. I want to move those to the transaction model instead.

## Test Cases

### Name Validation Tests

```php
describe('Category Entity Name Validation', function () {
    it('throws exception when name is empty')
    it('throws exception when name is null')
    it('throws exception when name exceeds 255 characters')
    it('accepts valid name')
    it('accepts name at exactly 255 characters')
    it('validates new name on changeName')
});
```

### Constructor Tests

```php
describe('Category Entity Constructor', function () {
    it('constructs with required fields and validates')
    it('preserves optional fields when provided')
});
```

### Business Method Tests

```php
describe('Category Entity Business Methods', function () {
    it('updates name via changeName and validates')
    it('updates notes via updateNotes and validates')
});
```

### Edge Case Tests

```php
describe('Category Entity Edge Cases', function () {
    it('handles unicode characters in name')
    it('handles special characters in notes')
    it('rejects whitespace-only name')
    it('trims whitespace from name')
});
```

## Acceptance Criteria

-   [ ] Entity class created at correct location
-   [ ] All 7 exception classes created
-   [ ] Name validation implemented per PRD
-   [ ] Notes validation implemented per PRD
-   [ ] Constructor validates on instantiation
-   [ ] All getters implemented
-   [ ] All business methods implemented
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 30+ test cases pass
-   [ ] No infrastructure dependencies (pure domain logic)
-   [ ] no references to Type or Recurring.

## Validation Checklist

-   [ ] Entity instantiates with valid data
-   [ ] Empty name throws `CategoryNameEmptyException`
-   [ ] Long name (256 chars) throws `InvalidCategoryNameException`
-   [ ] Long notes (1001 chars) throws `InvalidCategoryNotesException`
-   [ ] Run tests: `php artisan test --filter=CategoryEntityTest`
-   [ ] Code coverage: `php artisan test --coverage --min=100`

## Notes

-   This is pure domain logic with NO Laravel dependencies
-   No database, no Eloquent, no HTTP - just business rules
-   Entity should be framework-agnostic
-   Focus on business invariants and rules
-   Exceptions provide clear error messages
-   All validation happens in constructor and business methods

## Related PRD Sections

### Domain Model - Entities (Lines 145-165)

```
Category
├── id: int - Primary key
├── name: string - Category name (unique)
├── notes: string|null - Optional description
└── createdAt: DateTime - Creation timestamp

Business Rules:
- Name must be unique across all categories
- Cannot delete if has associated transactions
- Cannot delete if has associated recurring transactions

Validation:
- Name required, max 255 characters
- Type must be one of: 'income', 'expense'
- Notes optional, max 1000 characters
```

### Business Rules (Lines 528-547)

**Rule 1: Unique Category Names**  
**Description:** Each category name must be unique within the system  
**Triggers:** Create and update operations  
**Implementation:** Database unique constraint + application validation  
**Exceptions:** None

**Rule 2: Category Deletion Protection**  
**Description:** Cannot delete categories with associated transactions or recurring transactions  
**Triggers:** Delete operation  
**Implementation:** Check foreign key constraints before deletion  
**Exceptions:** None

### Validation Rules - Entity Validation (Lines 553-575)

```php
class Category {
    private function validate(): void {
        if (empty($this->name) || strlen($this->name) > 255) {
            throw new InvalidCategoryNameException('Category name too long');
        }

        // Notes validation
        if ($this->notes && strlen($this->notes) > 1000) {
            throw new InvalidCategoryNotesException('Category notes too long');
        }
    }
}
```

### Exception Hierarchy (Lines 595-603)

```
CategoryException
├── CategoryNotFoundException
├── CategoryAlreadyExistsException
├── CategoryHasTransactionsException
└── InvalidCategoryNameException
```

### Layer Architecture - Domain Layer (Lines 408-417)

**Entities:**

-   Category: Core business entity with validation

**Repository Interfaces:**

-   ICategoryRepository: Contract for data access

**Domain Services:**

-   None
