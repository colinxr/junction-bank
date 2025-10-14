# TICKET-014: Category Controller - List & Show

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-008, TICKET-009, TICKET-013  
**PRD Reference:** Lines 182-299, 440-450, 606-623

## Overview

Create the CategoryController with index() and show() methods to expose category read operations through the API. The controller serves as the interface layer, delegating business logic to use case services and handling HTTP concerns like status codes, error responses, and resource formatting per PRD specifications.

## Technical Specifications

### Controller Location

`app/Http/Controllers/CategoryController.php`

### Controller Structure

```php
namespace App\Http\Controllers;

use App\Http\Requests\IndexCategoriesRequest;
use App\Domains\Categories\Actions\IndexCategoriesService;
use App\Domains\Categories\Actions\ShowCategoryAction;
use App\Domains\Categories\Exceptions\CategoryNotFoundException;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(
        private IndexCategoriesService $indexService,
        private ShowCategoryAction $showAction
    ) {}

    /**
     * Display a listing of categories
     *
     * @param IndexCategoriesRequest $request
     * @return JsonResponse
     */
    public function index(IndexCategoriesRequest $request): JsonResponse
    {
        $result = $this->indexService->execute(
            page: $request->input('page', 1),
            limit: $request->input('limit', 20),
            type: $request->input('type')
        );

        return response()->json($result, 200);
    }

    /**
     * Display the specified category
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->showAction->execute($id);
            return response()->json(['data' => $category], 200);
        } catch (CategoryNotFoundException $e) {
            return response()->json([
                'error' => [
                    'message' => 'Category not found',
                    'code' => 'CATEGORY_NOT_FOUND'
                ]
            ], 404);
        }
    }
}
```

### Index Response Structure (PRD Lines 202-221)

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

### Show Response Structure (PRD Lines 283-295)

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

### Error Response Format (PRD Lines 612-623)

```json
{
    "error": {
        "message": "Category not found",
        "code": "CATEGORY_NOT_FOUND"
    }
}
```

## Implementation Tasks

1. Create CategoryController class
2. Inject IndexCategoriesService and ShowCategoryAction
3. Implement `index()` method
4. Type-hint IndexCategoriesRequest for validation
5. Extract query parameters with defaults
6. Call IndexCategoriesService
7. Return JSON response with 200 status
8. Implement `show()` method
9. Call ShowCategoryAction
10. Wrap result in 'data' key
11. Handle CategoryNotFoundException with 404
12. Add comprehensive PHPDoc
13. Write integration tests

## Test Cases

### Index Method Tests

```php
describe('CategoryController Index', function () {
    it('returns paginated categories with default parameters');
    it('returns categories for specific page');
    it('returns categories with custom limit');
    it('returns categories filtered by income type');
    it('returns categories filtered by expense type');
    it('returns 200 status code');
    it('includes data and pagination keys');
    it('delegates to IndexCategoriesService');
    it('passes validated request parameters to service');
});
```

### Index Response Format Tests

```php
describe('CategoryController Index Response Format', function () {
    it('returns data array with category objects');
    it('includes all category fields in each item');
    it('includes pagination metadata');
    it('includes currentPage in pagination');
    it('includes totalPages in pagination');
    it('includes totalItems in pagination');
    it('includes itemsPerPage in pagination');
    it('formats dates as ISO 8601');
    it('uses camelCase for property names');
});
```

### Index Validation Tests

```php
describe('CategoryController Index Validation', function () {
    it('validates using IndexCategoriesRequest');
    it('returns 422 for invalid page parameter');
    it('returns 422 for invalid limit parameter');
    it('returns 422 for invalid type parameter');
    it('returns validation errors in standard format');
});
```

### Show Method Tests

```php
describe('CategoryController Show', function () {
    it('returns single category by ID');
    it('returns 200 status code when found');
    it('wraps category in data key');
    it('delegates to ShowCategoryAction');
    it('passes ID to action');
});
```

### Show Error Handling Tests

```php
describe('CategoryController Show Error Handling', function () {
    it('returns 404 when category not found');
    it('returns error object with message');
    it('returns error object with code');
    it('catches CategoryNotFoundException');
    it('formats error per PRD specification');
    it('includes CATEGORY_NOT_FOUND code');
});
```

### Show Response Format Tests

```php
describe('CategoryController Show Response Format', function () {
    it('includes all category fields');
    it('formats dates as ISO 8601');
    it('uses camelCase for property names');
    it('includes id field');
    it('includes name field');
    it('includes type field');
    it('includes notes field');
    it('includes isRecurring field');
    it('includes createdAt field');
});
```

### Authentication Tests

```php
describe('CategoryController Authentication', function () {
    it('requires authentication for index');
    it('requires authentication for show');
    it('returns 401 when not authenticated');
    it('enforces auth via middleware');
});
```

### User Isolation Tests

```php
describe('CategoryController User Isolation', function () {
    it('only returns authenticated users categories in index');
    it('throws 404 when accessing another users category in show');
    it('enforces user isolation via service layer');
});
```

### Integration Tests

```php
describe('CategoryController Integration', function () {
    it('integrates with IndexCategoriesService correctly');
    it('integrates with ShowCategoryAction correctly');
    it('integrates with IndexCategoriesRequest validation');
    it('returns consistent response structure');
    it('handles end-to-end request flow');
});
```

### Edge Case Tests

```php
describe('CategoryController Edge Cases', function () {
    it('handles empty category list');
    it('handles single category');
    it('handles maximum limit of 100');
    it('handles very large page numbers');
    it('handles ID as zero in show');
    it('handles negative ID in show');
    it('handles concurrent requests');
});
```

## Acceptance Criteria

-   [ ] CategoryController class created at correct location
-   [ ] Constructor injects IndexCategoriesService and ShowCategoryAction
-   [ ] `index()` method implemented
-   [ ] IndexCategoriesRequest type-hinted for validation
-   [ ] Query parameters extracted with defaults (page=1, limit=20)
-   [ ] IndexCategoriesService called with correct parameters
-   [ ] `show()` method implemented
-   [ ] ShowCategoryAction called with ID
-   [ ] CategoryNotFoundException caught and handled
-   [ ] Response format matches PRD specification exactly
-   [ ] Status codes correct (200, 404)
-   [ ] Error format matches PRD specification
-   [ ] PHPDoc on all methods
-   [ ] 100% test coverage
-   [ ] All 50+ test cases pass

## Validation Checklist

-   [ ] Seed database with 25 categories
-   [ ] GET /api/categories
-   [ ] Verify 200 status code
-   [ ] Verify response has data and pagination keys
-   [ ] Verify first 20 categories returned
-   [ ] GET /api/categories?page=2&limit=10
-   [ ] Verify correct page 2 items with limit 10
-   [ ] GET /api/categories?type=income
-   [ ] Verify only income categories returned
-   [ ] GET /api/categories/1
-   [ ] Verify 200 status code
-   [ ] Verify single category with all fields
-   [ ] GET /api/categories/999
-   [ ] Verify 404 status code
-   [ ] Verify error format matches PRD
-   [ ] GET /api/categories?page=-1
-   [ ] Verify 422 validation error
-   [ ] Run tests: `php artisan test --filter=CategoryControllerTest`

## Notes

-   Controller is interface layer - thin HTTP adapter
-   Delegates all business logic to services
-   Handles HTTP concerns only (requests, responses, status codes)
-   Request validation via Form Request classes
-   Exception handling for clean error responses
-   Service layer enforces user isolation
-   Response format must match frontend expectations exactly
-   Use constructor injection for services
-   Keep methods focused and single-purpose
-   Return JsonResponse for type safety

## Related PRD Sections

-   **Endpoint 1: List Categories:** Lines 182-228
-   **Endpoint 3: Get Category:** Lines 277-299
-   **Layer Architecture - Interface Layer:** Lines 440-450
-   **Error Handling:** Lines 606-623
-   **Error Response Format:** Lines 612-623
-   **Authentication:** Lines 670-673
-   **Authorization:** Lines 674-676
