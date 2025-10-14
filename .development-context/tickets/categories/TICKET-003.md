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
    private string $type; // 'income' | 'expense'
    private ?string $notes;
    private bool $isRecurring;
    private ?\DateTimeInterface $createdAt;

    public function __construct(
        string $name,
        string $type,
        ?string $notes = null,
        bool $isRecurring = false,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null
    ) {
        $this->name = $name;
        $this->type = $type;
        $this->notes = $notes;
        $this->isRecurring = $isRecurring;
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

#### Type Validation

-   **Required:** Must be 'income' or 'expense'
-   **Exception:** `InvalidCategoryTypeException` if not in ['income', 'expense']

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
class CategoryNameEmptyException extends CategoryException {}
class InvalidCategoryNameException extends CategoryException {}
class InvalidCategoryTypeException extends CategoryException {}
class InvalidCategoryNotesException extends CategoryException {}
class CategoryNotFoundException extends CategoryException {}
class CategoryAlreadyExistsException extends CategoryException {}
class CategoryHasTransactionsException extends CategoryException {}
```

### Business Methods

```php
public function changeName(string $newName): void
public function changeType(string $newType): void
public function updateNotes(?string $newNotes): void
public function markAsRecurring(): void
public function markAsNonRecurring(): void
```

## Implementation Tasks

1. Create entity class with private properties
2. Implement constructor with validation
3. Implement `validate()` method with all rules
4. Create all exception classes
5. Add getter methods
6. Add business methods for state changes
7. Add PHPDoc annotations
8. Write comprehensive unit tests

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

### Type Validation Tests

```php
describe('Category Entity Type Validation', function () {
    it('accepts income type')
    it('accepts expense type')
    it('throws exception for invalid type')
    it('throws exception for null type')
    it('throws exception for empty type')
    it('throws exception for uppercase INCOME')
    it('validates new type on changeType')
});
```

### Notes Validation Tests

```php
describe('Category Entity Notes Validation', function () {
    it('accepts null notes')
    it('accepts empty string notes')
    it('accepts valid notes')
    it('throws exception when notes exceed 1000 characters')
    it('accepts notes at exactly 1000 characters')
    it('validates new notes on updateNotes')
});
```

### Constructor Tests

```php
describe('Category Entity Constructor', function () {
    it('creates entity with all fields')
    it('creates entity with minimal fields')
    it('validates on construction')
    it('sets default values correctly')
    it('preserves id when provided')
    it('preserves createdAt when provided')
});
```

### Business Method Tests

```php
describe('Category Entity Business Methods', function () {
    it('updates name via changeName and validates')
    it('updates type via changeType and validates')
    it('updates notes via updateNotes and validates')
    it('sets flag to true via markAsRecurring')
    it('sets flag to false via markAsNonRecurring')
});
```

### Immutability Tests

```php
describe('Category Entity Immutability', function () {
    it('has properties that are not publicly accessible')
    it('allows changes only via methods')
    it('returns values correctly via getters')
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
-   [ ] Type validation implemented per PRD
-   [ ] Notes validation implemented per PRD
-   [ ] Constructor validates on instantiation
-   [ ] All getters implemented
-   [ ] All business methods implemented
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 30+ test cases pass
-   [ ] No infrastructure dependencies (pure domain logic)

## Validation Checklist

-   [ ] Entity instantiates with valid data
-   [ ] Empty name throws `CategoryNameEmptyException`
-   [ ] Long name (256 chars) throws `InvalidCategoryNameException`
-   [ ] Invalid type throws `InvalidCategoryTypeException`
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

-   **Domain Model - Entities:** Lines 145-165
-   **Business Rules:** Lines 528-547
-   **Validation Rules - Entity Validation:** Lines 553-575
-   **Exception Hierarchy:** Lines 595-603
-   **Layer Architecture - Domain Layer:** Lines 408-417
