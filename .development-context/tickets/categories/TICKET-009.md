# TICKET-009: ShowCategory Use Case

**Estimate:** 2 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-007  
**PRD Reference:** Lines 277-299, 420-425

## Overview

Implement the ShowCategoryAction use case that retrieves a single category by ID. This service orchestrates the repository layer, handles not found scenarios, and returns properly formatted DTOs for the API layer. Leverages repository caching for performance.

## Technical Specifications

### Service Location

`app/Domains/Categories/Actions/ShowCategoryAction.php`

### Service Structure

```php
namespace App\Domains\Categories\Actions;

use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Domains\Categories\Exceptions\CategoryNotFoundException;

class ShowCategoryAction
{
    public function __construct(
        private ICategoryRepository $repository,
        private CategoryMapper $mapper
    ) {}

    /**
     * Execute the show category use case
     *
     * @param int $id Category ID
     * @return array Category DTO
     * @throws CategoryNotFoundException When category not found
     */
    public function execute(int $id): array
    {
        $entity = $this->repository->findById($id);

        return $this->mapper->toDTO($entity);
    }
}
```

### Response Structure (PRD Lines 283-295)

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

### Error Handling (PRD Lines 297-299)

**Error Response (404):**

```json
{
    "error": {
        "message": "Category not found",
        "code": "CATEGORY_NOT_FOUND"
    }
}
```

## Implementation Tasks

1. Create ShowCategoryAction class
2. Inject repository and mapper dependencies
3. Implement `execute()` method
4. Call repository findById
5. Transform entity to DTO
6. Let CategoryNotFoundException bubble up to controller
7. Add comprehensive PHPDoc
8. Write unit tests

## Test Cases

### Happy Path Tests

```php
describe('ShowCategoryAction Happy Path', function () {
    it('returns category DTO when found');
    it('includes all category fields in response');
    it('transforms entity to DTO correctly');
    it('preserves all entity data');
});
```

### Not Found Tests

```php
describe('ShowCategoryAction Not Found', function () {
    it('throws CategoryNotFoundException when not found');
    it('includes category ID in exception message');
    it('propagates exception from repository');
});
```

### Caching Tests

```php
describe('ShowCategoryAction Caching', function () {
    it('benefits from repository cache on first call');
    it('benefits from repository cache on subsequent calls');
    it('repository handles cache internally');
});
```

### Integration Tests

```php
describe('ShowCategoryAction Integration', function () {
    it('calls repository findById with correct ID');
    it('calls mapper toDTO with entity');
    it('returns DTO structure matching API spec');
});
```

### User Isolation Tests

```php
describe('ShowCategoryAction User Isolation', function () {
    it('throws exception when accessing another users category');
    it('only returns categories for authenticated user');
});
```

### Data Integrity Tests

```php
describe('ShowCategoryAction Data Integrity', function () {
    it('returns exact entity data in DTO');
    it('does not modify entity during transformation');
    it('handles null notes correctly');
    it('formats dates correctly');
});
```

### Edge Case Tests

```php
describe('ShowCategoryAction Edge Cases', function () {
    it('handles ID as zero');
    it('handles negative ID');
    it('handles very large ID');
    it('handles newly created category');
    it('handles category with minimal data');
});
```

## Acceptance Criteria

-   [ ] ShowCategoryAction class created at correct location
-   [ ] Constructor injects repository and mapper
-   [ ] `execute()` method implemented
-   [ ] Repository findById called with correct ID
-   [ ] Entity transformed to DTO
-   [ ] CategoryNotFoundException propagated to caller
-   [ ] Response structure matches PRD specification
-   [ ] User isolation enforced via repository
-   [ ] Caching leveraged via repository
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 20+ test cases pass

## Validation Checklist

-   [ ] Create category via seeder with ID 1
-   [ ] Call service with ID 1
-   [ ] Verify category returned with all fields
-   [ ] Verify date format: `2024-12-19T10:00:00Z`
-   [ ] Call service with non-existent ID 999
-   [ ] Verify CategoryNotFoundException thrown
-   [ ] Verify exception message includes ID
-   [ ] Create category as user A
-   [ ] Attempt to retrieve as user B
-   [ ] Verify exception thrown (user isolation)
-   [ ] Run tests: `php artisan test --filter=ShowCategoryActionTest`

## Notes

-   Service is application layer - orchestrates domain and infrastructure
-   No direct database access - uses repository
-   User authentication handled by middleware
-   User isolation enforced by repository
-   Repository handles caching internally (24-hour TTL per PRD)
-   Exception handling delegated to controller/exception handler
-   Service remains thin - just orchestration logic
-   Response format must match frontend expectations exactly

## Related PRD Sections

-   **Endpoint 3: Get Category:** Lines 277-299
-   **Use Cases:** Lines 420-425
-   **API Response Format:** Lines 283-295
-   **Error Handling:** Lines 297-299, 606-611
-   **Caching Strategy:** Lines 505-525 (single category: 24 hours)
-   **Exception Hierarchy:** Lines 595-603
