# TICKET-010: StoreCategory Use Case

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-007  
**PRD Reference:** Lines 231-275, 420-425

## Overview

Implement the StoreCategoryAction use case that creates new categories with full validation. This service creates domain entities, validates business rules, persists via repository, and handles cache invalidation. Enforces uniqueness constraints per PRD specifications.

## Technical Specifications

### Service Location

`app/Domains/Categories/Actions/StoreCategoryAction.php`

### Service Structure

```php
namespace App\Domains\Categories\Actions;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;

class StoreCategoryAction
{
    public function __construct(
        private ICategoryRepository $repository,
        private CategoryMapper $mapper
    ) {}

    /**
     * Execute the store category use case
     *
     * @param string $name Category name (required, max 255)
     * @param string $type Category type ('income' or 'expense')
     * @param string|null $notes Optional notes (max 1000)
     * @return array Created category DTO
     * @throws CategoryAlreadyExistsException When name already exists
     * @throws InvalidCategoryNameException When name validation fails
     * @throws InvalidCategoryTypeException When type validation fails
     * @throws InvalidCategoryNotesException When notes validation fails
     */
    public function execute(string $name, string $type, ?string $notes = null): array
    {
        // Create entity (validates in constructor)
        $entity = new Category(
            name: $name,
            type: $type,
            notes: $notes,
            isRecurring: false
        );

        // Persist via repository (checks uniqueness and invalidates cache)
        $createdEntity = $this->repository->create($entity);

        // Transform to DTO
        return $this->mapper->toDTO($createdEntity);
    }
}
```

### Request Structure (PRD Lines 236-243)

```json
{
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items"
}
```

### Response Structure (PRD Lines 250-262)

```json
{
    "data": {
        "id": 1,
        "name": "Groceries",
        "type": "expense",
        "notes": "Food and household items",
        "isRecurring": false,
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

### Validation Rules (PRD Lines 245-249, 553-575)

-   **name:** required, string, max: 255, unique
-   **type:** required, string, in: income,expense
-   **notes:** nullable, string, max: 1000

### Business Logic (PRD Lines 268-275)

1. Validate input data (entity constructor)
2. Check name uniqueness (repository)
3. Create category entity
4. Persist to database (repository)
5. Invalidate cache (repository)
6. Return created category DTO

### Error Handling (PRD Lines 264-267)

-   **400:** Validation errors (entity validation)
-   **409:** Category name already exists

## Implementation Tasks

1. Create StoreCategoryAction class
2. Inject repository and mapper dependencies
3. Implement `execute()` method
4. Create Category entity with provided data
5. Call repository create method
6. Let exceptions bubble up (entity validation, uniqueness)
7. Transform created entity to DTO
8. Add comprehensive PHPDoc
9. Write unit tests

## Test Cases

### Happy Path Tests

```php
describe('StoreCategoryAction Happy Path', function () {
    it('creates category with all fields');
    it('creates category with minimal fields');
    it('creates category with null notes');
    it('sets isRecurring to false by default');
    it('returns DTO with generated ID');
    it('returns DTO with createdAt timestamp');
    it('transforms created entity correctly');
});
```

### Uniqueness Tests

```php
describe('StoreCategoryAction Uniqueness', function () {
    it('throws exception when name already exists');
    it('allows same name for different users');
    it('is case-sensitive for uniqueness check');
    it('checks uniqueness before persistence');
});
```

### Validation Tests

```php
describe('StoreCategoryAction Validation', function () {
    it('throws exception when name is empty');
    it('throws exception when name exceeds 255 characters');
    it('throws exception when type is invalid');
    it('throws exception when notes exceed 1000 characters');
    it('accepts valid income type');
    it('accepts valid expense type');
    it('accepts null notes');
    it('validates data via entity constructor');
});
```

### Cache Invalidation Tests

```php
describe('StoreCategoryAction Cache Invalidation', function () {
    it('invalidates list cache after creation');
    it('invalidates user categories cache after creation');
    it('repository handles cache invalidation');
});
```

### Integration Tests

```php
describe('StoreCategoryAction Integration', function () {
    it('creates entity from input data');
    it('calls repository create with entity');
    it('persists category to database');
    it('returns DTO matching API spec');
    it('includes all required fields in response');
});
```

### User Isolation Tests

```php
describe('StoreCategoryAction User Isolation', function () {
    it('associates category with authenticated user');
    it('allows duplicate names across different users');
    it('only checks uniqueness within user scope');
});
```

### Edge Case Tests

```php
describe('StoreCategoryAction Edge Cases', function () {
    it('handles name at exactly 255 characters');
    it('handles notes at exactly 1000 characters');
    it('handles unicode characters in name');
    it('handles special characters in notes');
    it('trims whitespace from name');
    it('rejects whitespace-only name');
});
```

### Exception Handling Tests

```php
describe('StoreCategoryAction Exception Handling', function () {
    it('propagates CategoryAlreadyExistsException');
    it('propagates InvalidCategoryNameException');
    it('propagates InvalidCategoryTypeException');
    it('propagates InvalidCategoryNotesException');
    it('includes helpful error messages');
});
```

## Acceptance Criteria

-   [ ] StoreCategoryAction class created at correct location
-   [ ] Constructor injects repository and mapper
-   [ ] `execute()` method implemented
-   [ ] Category entity created with input data
-   [ ] Entity validation performed in constructor
-   [ ] Repository create called with entity
-   [ ] Uniqueness check enforced by repository
-   [ ] Cache invalidation handled by repository
-   [ ] Created entity transformed to DTO
-   [ ] Response structure matches PRD specification
-   [ ] All exceptions properly propagated
-   [ ] User isolation enforced via repository
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 35+ test cases pass

## Validation Checklist

-   [ ] Create category with valid data
-   [ ] Verify category persisted with ID
-   [ ] Verify createdAt timestamp set
-   [ ] Verify isRecurring defaults to false
-   [ ] Create category with duplicate name
-   [ ] Verify CategoryAlreadyExistsException thrown
-   [ ] Create category with empty name
-   [ ] Verify CategoryNameEmptyException thrown
-   [ ] Create category with name over 255 chars
-   [ ] Verify InvalidCategoryNameException thrown
-   [ ] Create category with invalid type 'other'
-   [ ] Verify InvalidCategoryTypeException thrown
-   [ ] Create category with notes over 1000 chars
-   [ ] Verify InvalidCategoryNotesException thrown
-   [ ] Create category as user A
-   [ ] Create category with same name as user B
-   [ ] Verify both succeed (user isolation)
-   [ ] Run tests: `php artisan test --filter=StoreCategoryActionTest`

## Notes

-   Service is application layer - orchestrates domain and infrastructure
-   Entity constructor validates business rules
-   Repository checks uniqueness and handles persistence
-   Repository handles cache invalidation automatically
-   User ID set by repository from auth context
-   No direct database access in service
-   isRecurring defaults to false for regular categories
-   Exception messages should be clear and actionable
-   Response format must match frontend expectations exactly

## Related PRD Sections

-   **Endpoint 2: Create Category:** Lines 231-275
-   **Use Cases:** Lines 420-425
-   **Validation Rules - Entity:** Lines 553-575
-   **Validation Rules - Form Request:** Lines 578-589
-   **Business Logic:** Lines 268-275
-   **Error Handling:** Lines 264-267, 606-611
-   **Caching Strategy - Invalidation:** Lines 519-525
-   **Exception Hierarchy:** Lines 595-603
