# TICKET-011: UpdateCategory Use Case

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-007  
**PRD Reference:** Lines 301-333, 420-425

## Overview

Implement the UpdateCategoryAction use case that updates existing categories with full validation. This service validates business rules, handles uniqueness checks excluding self, persists changes via repository, and handles cache invalidation. Supports partial updates per PRD specifications.

## Technical Specifications

### Service Location

`app/Domains/Categories/Actions/UpdateCategoryAction.php`

### Service Structure

```php
namespace App\Domains\Categories\Actions;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Domains\Categories\Exceptions\{
    CategoryNotFoundException,
    CategoryAlreadyExistsException
};

class UpdateCategoryAction
{
    public function __construct(
        private ICategoryRepository $repository,
        private CategoryMapper $mapper
    ) {}

    /**
     * Execute the update category use case
     *
     * @param int $id Category ID
     * @param array $data Update data ['name', 'type', 'notes']
     * @return array Updated category DTO
     * @throws CategoryNotFoundException When category not found
     * @throws CategoryAlreadyExistsException When new name conflicts
     * @throws InvalidCategoryNameException When name validation fails
     * @throws InvalidCategoryTypeException When type validation fails
     * @throws InvalidCategoryNotesException When notes validation fails
     */
    public function execute(int $id, array $data): array
    {
        // Get existing category
        $entity = $this->repository->findById($id);

        // Apply updates to entity (validates changes)
        if (isset($data['name'])) {
            $entity->changeName($data['name']);
        }

        if (isset($data['type'])) {
            $entity->changeType($data['type']);
        }

        if (array_key_exists('notes', $data)) {
            $entity->updateNotes($data['notes']);
        }

        // Persist via repository (checks uniqueness and invalidates cache)
        $updatedEntity = $this->repository->update($entity);

        // Transform to DTO
        return $this->mapper->toDTO($updatedEntity);
    }
}
```

### Request Structure (PRD Lines 307-313)

```json
{
    "name": "Food & Groceries",
    "notes": "Updated description"
}
```

### Response Structure (PRD Lines 320-332)

```json
{
    "data": {
        "id": 1,
        "name": "Food & Groceries",
        "type": "expense",
        "notes": "Updated description",
        "isRecurring": false,
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

### Validation Rules (PRD Lines 315-319)

-   **name:** string, max: 255, unique (if changed, excluding current)
-   **type:** string, in: income,expense
-   **notes:** nullable, string, max: 1000

### Business Logic

1. Find existing category by ID
2. Validate input data (entity methods)
3. Check name uniqueness excluding self (repository)
4. Apply changes to entity
5. Persist to database (repository)
6. Invalidate cache (repository)
7. Return updated category DTO

### Error Handling

-   **404:** Category not found
-   **409:** New name conflicts with existing category
-   **400:** Validation errors (entity validation)

## Implementation Tasks

1. Create UpdateCategoryAction class
2. Inject repository and mapper dependencies
3. Implement `execute()` method
4. Retrieve existing category entity
5. Apply updates using entity business methods
6. Call repository update method
7. Let exceptions bubble up (not found, uniqueness, validation)
8. Transform updated entity to DTO
9. Add comprehensive PHPDoc
10. Write unit tests

## Test Cases

### Happy Path Tests

```php
describe('UpdateCategoryAction Happy Path', function () {
    it('updates category name only');
    it('updates category type only');
    it('updates category notes only');
    it('updates all fields at once');
    it('updates to null notes');
    it('returns DTO with updated data');
    it('preserves unchanged fields');
    it('preserves ID and createdAt');
});
```

### Uniqueness Tests

```php
describe('UpdateCategoryAction Uniqueness', function () {
    it('throws exception when new name already exists');
    it('allows updating to same name');
    it('allows same name for different users');
    it('excludes self when checking uniqueness');
    it('is case-sensitive for uniqueness check');
});
```

### Not Found Tests

```php
describe('UpdateCategoryAction Not Found', function () {
    it('throws exception when category not found');
    it('throws exception for another users category');
    it('includes category ID in exception message');
});
```

### Validation Tests

```php
describe('UpdateCategoryAction Validation', function () {
    it('throws exception when name is empty');
    it('throws exception when name exceeds 255 characters');
    it('throws exception when type is invalid');
    it('throws exception when notes exceed 1000 characters');
    it('accepts valid income type');
    it('accepts valid expense type');
    it('accepts null notes');
    it('validates via entity business methods');
});
```

### Partial Update Tests

```php
describe('UpdateCategoryAction Partial Updates', function () {
    it('updates only provided fields');
    it('preserves fields not in update data');
    it('handles empty update data');
    it('handles update with only notes');
    it('allows changing only type');
});
```

### Cache Invalidation Tests

```php
describe('UpdateCategoryAction Cache Invalidation', function () {
    it('invalidates specific category cache');
    it('invalidates list cache after update');
    it('invalidates user categories cache');
    it('repository handles cache invalidation');
});
```

### Integration Tests

```php
describe('UpdateCategoryAction Integration', function () {
    it('retrieves entity from repository');
    it('applies changes via entity methods');
    it('calls repository update with entity');
    it('persists changes to database');
    it('returns DTO matching API spec');
});
```

### User Isolation Tests

```php
describe('UpdateCategoryAction User Isolation', function () {
    it('throws exception updating another users category');
    it('only checks uniqueness within user scope');
    it('maintains user association after update');
});
```

### Edge Case Tests

```php
describe('UpdateCategoryAction Edge Cases', function () {
    it('handles name at exactly 255 characters');
    it('handles notes at exactly 1000 characters');
    it('handles unicode characters in name');
    it('handles special characters in notes');
    it('handles updating multiple times consecutively');
    it('handles updating to identical values');
});
```

### Exception Handling Tests

```php
describe('UpdateCategoryAction Exception Handling', function () {
    it('propagates CategoryNotFoundException');
    it('propagates CategoryAlreadyExistsException');
    it('propagates InvalidCategoryNameException');
    it('propagates InvalidCategoryTypeException');
    it('propagates InvalidCategoryNotesException');
    it('includes helpful error messages');
});
```

## Acceptance Criteria

-   [ ] UpdateCategoryAction class created at correct location
-   [ ] Constructor injects repository and mapper
-   [ ] `execute()` method implemented
-   [ ] Existing category retrieved by ID
-   [ ] Updates applied via entity business methods
-   [ ] Entity validation performed in business methods
-   [ ] Repository update called with entity
-   [ ] Uniqueness check excludes self
-   [ ] Cache invalidation handled by repository
-   [ ] Updated entity transformed to DTO
-   [ ] Response structure matches PRD specification
-   [ ] Partial updates supported
-   [ ] All exceptions properly propagated
-   [ ] User isolation enforced via repository
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 45+ test cases pass

## Validation Checklist

-   [ ] Create category with name "Groceries"
-   [ ] Update category name to "Food"
-   [ ] Verify name changed, other fields unchanged
-   [ ] Update category with same name
-   [ ] Verify no exception (excluding self)
-   [ ] Create second category "Entertainment"
-   [ ] Update first category name to "Entertainment"
-   [ ] Verify CategoryAlreadyExistsException thrown
-   [ ] Update category ID 999 (non-existent)
-   [ ] Verify CategoryNotFoundException thrown
-   [ ] Update category with empty name
-   [ ] Verify CategoryNameEmptyException thrown
-   [ ] Update category with name over 255 chars
-   [ ] Verify InvalidCategoryNameException thrown
-   [ ] Update category with invalid type 'other'
-   [ ] Verify InvalidCategoryTypeException thrown
-   [ ] Create category as user A
-   [ ] Attempt to update as user B
-   [ ] Verify exception thrown (user isolation)
-   [ ] Run tests: `php artisan test --filter=UpdateCategoryActionTest`

## Notes

-   Service is application layer - orchestrates domain and infrastructure
-   Entity business methods validate changes
-   Repository checks uniqueness excluding self
-   Repository handles cache invalidation automatically
-   User isolation enforced by repository
-   No direct database access in service
-   Supports partial updates (only provided fields)
-   Empty update data is valid (no-op)
-   Exception messages should be clear and actionable
-   Response format must match frontend expectations exactly
-   isRecurring and createdAt cannot be changed via update

## Related PRD Sections

-   **Endpoint 4: Update Category:** Lines 301-333
-   **Use Cases:** Lines 420-425
-   **Validation Rules - Entity:** Lines 553-575
-   **Validation Rules - Form Request:** Lines 315-319
-   **Business Logic:** PRD update flow
-   **Error Handling:** Lines 606-611
-   **Caching Strategy - Invalidation:** Lines 519-525
-   **Exception Hierarchy:** Lines 595-603
-   **Business Rule - Uniqueness:** Lines 530-535
