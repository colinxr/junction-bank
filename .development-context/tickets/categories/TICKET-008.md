# TICKET-008: IndexCategories Use Case

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-007  
**PRD Reference:** Lines 182-228, 420-425

## Overview

Implement the IndexCategoriesService use case that retrieves paginated, filtered lists of categories. This service orchestrates the repository layer and returns properly formatted DTOs for the API layer. Supports pagination and type filtering per PRD specifications.

## Technical Specifications

### Service Location

`app/Domains/Categories/Actions/IndexCategoriesService.php`

### Service Structure

```php
namespace App\Domains\Categories\Actions;

use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;

class IndexCategoriesService
{
    public function __construct(
        private ICategoryRepository $repository,
        private CategoryMapper $mapper
    ) {}

    /**
     * Execute the index categories use case
     *
     * @param int $page Page number (min: 1)
     * @param int $limit Items per page (min: 1, max: 100)
     * @param string|null $type Filter by type ('income' or 'expense')
     * @return array CategoryListDTO with data and pagination
     */
    public function execute(int $page = 1, int $limit = 20, ?string $type = null): array
    {
        // Validate parameters
        $page = max(1, $page);
        $limit = min(100, max(1, $limit));

        if ($type !== null && !in_array($type, ['income', 'expense'])) {
            throw new \InvalidArgumentException('Type must be income or expense');
        }

        // Get paginated results from repository
        $result = $this->repository->findAll($page, $limit, $type);

        // Transform entities to DTOs
        $result['data'] = $this->mapper->toDTOCollection($result['data']);

        return $result;
    }
}
```

### Response Structure (PRD Lines 202-221)

```json
{
    "data": [
        {
            "id": 1,
            "name": "Groceries",
            "type": "expense",
            "notes": "Food and household items",
            "isRecurring": false,
            "createdAt": "2024-12-19T10:00:00Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 100,
        "itemsPerPage": 20
    }
}
```

### Business Logic (PRD Lines 223-228)

1. Authenticate user (handled by middleware)
2. Query categories for user (repository handles user scoping)
3. Apply pagination and filtering
4. Return formatted response

## Implementation Tasks

1. Create IndexCategoriesService class
2. Inject repository and mapper dependencies
3. Implement `execute()` method
4. Add parameter validation (bounds checking)
5. Call repository with correct parameters
6. Transform entity collection to DTO collection
7. Return response with data and pagination metadata
8. Add comprehensive PHPDoc
9. Write unit tests

## Test Cases

### Happy Path Tests

```php
describe('IndexCategoriesService Happy Path', function () {
    it('returns paginated categories with default parameters');
    it('returns categories for specific page');
    it('returns categories with custom limit');
    it('returns categories filtered by income type');
    it('returns categories filtered by expense type');
    it('returns data and pagination metadata');
    it('transforms entities to DTOs correctly');
});
```

### Pagination Tests

```php
describe('IndexCategoriesService Pagination', function () {
    it('defaults to page 1 when not specified');
    it('defaults to limit 20 when not specified');
    it('enforces minimum page of 1');
    it('enforces minimum limit of 1');
    it('enforces maximum limit of 100');
    it('calculates total pages correctly');
    it('returns correct currentPage in metadata');
    it('returns correct itemsPerPage in metadata');
    it('handles last page with partial results');
});
```

### Filtering Tests

```php
describe('IndexCategoriesService Filtering', function () {
    it('returns all categories when type is null');
    it('returns only income categories when type is income');
    it('returns only expense categories when type is expense');
    it('throws exception for invalid type');
    it('is case-sensitive for type parameter');
});
```

### Empty Results Tests

```php
describe('IndexCategoriesService Empty Results', function () {
    it('returns empty data array when no categories');
    it('returns zero totalItems when no categories');
    it('returns pagination metadata for empty results');
    it('returns empty data for filtered type with no matches');
});
```

### Parameter Validation Tests

```php
describe('IndexCategoriesService Parameter Validation', function () {
    it('coerces negative page to 1');
    it('coerces zero page to 1');
    it('coerces negative limit to 1');
    it('coerces zero limit to 1');
    it('coerces limit over 100 to 100');
    it('accepts valid type values');
    it('rejects invalid type values');
});
```

### Integration Tests

```php
describe('IndexCategoriesService Integration', function () {
    it('calls repository with correct parameters');
    it('calls mapper for each entity');
    it('preserves pagination metadata from repository');
    it('returns consistent response structure');
});
```

### Edge Case Tests

```php
describe('IndexCategoriesService Edge Cases', function () {
    it('handles requesting page beyond available pages');
    it('handles limit larger than total items');
    it('handles exactly one page of results');
    it('handles exactly limit results');
    it('maintains user isolation via repository');
});
```

## Acceptance Criteria

-   [ ] IndexCategoriesService class created at correct location
-   [ ] Constructor injects repository and mapper
-   [ ] `execute()` method implemented with all parameters
-   [ ] Pagination parameters validated (bounds checking)
-   [ ] Type parameter validated (income/expense only)
-   [ ] Repository called with correct parameters
-   [ ] Entity collection transformed to DTO collection
-   [ ] Response structure matches PRD specification
-   [ ] Empty results handled gracefully
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 35+ test cases pass

## Validation Checklist

-   [ ] Create 25 categories via seeder
-   [ ] Call service with page=1, limit=10
-   [ ] Verify 10 items returned with correct pagination
-   [ ] Call service with page=3, limit=10
-   [ ] Verify correct items for page 3
-   [ ] Call service with type='income'
-   [ ] Verify only income categories returned
-   [ ] Call service with page=-1
-   [ ] Verify coerced to page 1
-   [ ] Call service with limit=200
-   [ ] Verify coerced to limit 100
-   [ ] Run tests: `php artisan test --filter=IndexCategoriesServiceTest`

## Notes

-   Service is application layer - orchestrates domain and infrastructure
-   No direct database access - uses repository
-   User authentication handled by middleware
-   User isolation enforced by repository
-   Parameter validation prevents invalid queries
-   Repository handles caching internally
-   Response format must match frontend expectations exactly

## Related PRD Sections

-   **Endpoint 1: List Categories:** Lines 182-228
-   **Use Cases:** Lines 420-425
-   **API Response Format:** Lines 202-221
-   **Pagination Logic:** Lines 213-220
-   **Filtering Logic:** Lines 188-199
