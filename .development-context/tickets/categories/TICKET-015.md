# TICKET-015: Category Controller - Create

**Estimate:** 2-3 hours  
**Priority:** Critical  
**Dependencies:** TICKET-010, TICKET-013, TICKET-014  
**PRD Reference:** Lines 231-275, 440-450, 606-623

## Overview

Implement the store() method in CategoryController to handle category creation through the API. The controller validates input via StoreCategoryRequest, delegates creation to StoreCategoryAction, and returns properly formatted responses with correct HTTP status codes per PRD specifications.

## Technical Specifications

### Controller Method

Add to existing `app/Http/Controllers/CategoryController.php`

```php
use App\Http\Requests\StoreCategoryRequest;
use App\Domains\Categories\Actions\StoreCategoryAction;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;

public function __construct(
    private IndexCategoriesService $indexService,
    private ShowCategoryAction $showAction,
    private StoreCategoryAction $storeAction
) {}

/**
 * Store a newly created category
 *
 * @param StoreCategoryRequest $request
 * @return JsonResponse
 */
public function store(StoreCategoryRequest $request): JsonResponse
{
    try {
        $category = $this->storeAction->execute(
            name: $request->input('name'),
            notes: $request->input('notes')
        );

        return response()->json(['data' => $category], 201);
    } catch (CategoryAlreadyExistsException $e) {
        return response()->json([
            'error' => [
                'message' => 'Category name already exists',
                'code' => 'CATEGORY_EXISTS'
            ]
        ], 409);
    }
}
```

### Request Structure (PRD Lines 236-243)

```json
{
    "name": "Groceries",
    "notes": "Food and household items"
}
```

### Response Structure (PRD Lines 250-262)

```json
{
    "data": {
        "id": 1,
        "name": "Groceries",
        "notes": "Food and household items",
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

### Error Responses (PRD Lines 264-267)

**400 Validation Error:**

```json
{
    "error": {
        "message": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": {
            "name": ["The name field is required."]
        }
    }
}
```

**409 Duplicate Error:**

```json
{
    "error": {
        "message": "Category name already exists",
        "code": "CATEGORY_EXISTS"
    }
}
```

## Implementation Tasks

1. Add StoreCategoryAction to constructor injection
2. Implement `store()` method
3. Type-hint StoreCategoryRequest for validation
4. Extract input parameters (name, notes)
5. Call StoreCategoryAction with parameters
6. Wrap result in 'data' key
7. Return 201 status code on success
8. Catch CategoryAlreadyExistsException
9. Return 409 status with error format
10. Add PHPDoc documentation
11. Write integration tests

## Test Cases

### Happy Path Tests

```php
describe('CategoryController Store Happy Path', function () {
    it('creates category with all fields');
    it('creates category with minimal fields');
    it('creates category with null notes');
    it('returns 201 status code');
    it('wraps category in data key');
    it('returns category with generated ID');
    it('returns category with createdAt timestamp');
    it('delegates to StoreCategoryAction');
    it('passes all input parameters to action');
});
```

### Validation Tests

```php
describe('CategoryController Store Validation', function () {
    it('validates using StoreCategoryRequest');
    it('returns 422 when name is missing');
    it('returns 422 when name exceeds 255 characters');
    it('returns 422 when notes exceed 1000 characters');
    it('returns validation errors in standard format');
    it('returns multiple errors for multiple violations');
});
```

### Duplicate Handling Tests

```php
describe('CategoryController Store Duplicate Handling', function () {
    it('returns 409 when name already exists');
    it('catches CategoryAlreadyExistsException');
    it('returns error object with message');
    it('returns error object with CATEGORY_EXISTS code');
    it('formats error per PRD specification');
    it('does not create duplicate category');
    it('allows same name for different users');
});
```

### Response Format Tests

```php
describe('CategoryController Store Response Format', function () {
    it('includes all category fields');
    it('formats dates as ISO 8601');
    it('uses camelCase for property names');
    it('includes generated id field');
    it('includes name field');
    it('includes notes field');
    it('includes createdAt timestamp');
});
```

### Authentication Tests

```php
describe('CategoryController Store Authentication', function () {
    it('requires authentication');
    it('returns 401 when not authenticated');
    it('enforces auth via middleware');
    it('associates category with authenticated user');
});
```

### User Isolation Tests

```php
describe('CategoryController Store User Isolation', function () {
    it('creates category for authenticated user only');
    it('allows duplicate names across different users');
    it('enforces user scoping via service layer');
});
```

### Input Handling Tests

```php
describe('CategoryController Store Input Handling', function () {
    it('handles name at exactly 255 characters');
    it('handles notes at exactly 1000 characters');
    it('handles unicode characters in name');
    it('handles special characters in notes');
    it('handles missing optional notes field');
    it('handles null notes value');
});
```

### Integration Tests

```php
describe('CategoryController Store Integration', function () {
    it('integrates with StoreCategoryAction correctly');
    it('integrates with StoreCategoryRequest validation');
    it('persists category to database');
    it('invalidates cache after creation');
    it('returns consistent response structure');
    it('handles end-to-end creation flow');
});
```

### Edge Case Tests

```php
describe('CategoryController Store Edge Cases', function () {
    it('handles rapid successive creations');
    it('handles concurrent creation attempts');
    it('handles creation with empty notes string vs null');
    it('handles whitespace-only name validation');
    it('handles creation after deletion of same name');
});
```

### Error Handling Tests

```php
describe('CategoryController Store Error Handling', function () {
    it('catches and formats CategoryAlreadyExistsException');
    it('propagates validation errors from request');
    it('returns proper HTTP status codes');
    it('includes helpful error messages');
    it('maintains data integrity on errors');
});
```

## Acceptance Criteria

-   [ ] `store()` method implemented in CategoryController
-   [ ] Constructor injects StoreCategoryAction
-   [ ] StoreCategoryRequest type-hinted for validation
-   [ ] Input parameters extracted (name, notes)
-   [ ] StoreCategoryAction called with parameters
-   [ ] Result wrapped in 'data' key
-   [ ] 201 status returned on success
-   [ ] CategoryAlreadyExistsException caught
-   [ ] 409 status returned for duplicates
-   [ ] Error format matches PRD specification
-   [ ] Response format matches PRD specification
-   [ ] PHPDoc on method
-   [ ] 100% test coverage
-   [ ] All 45+ test cases pass

## Validation Checklist

-   [ ] POST /api/categories with valid data
-   [ ] Verify 201 status code
-   [ ] Verify category created with all fields
-   [ ] Verify generated ID present
-   [ ] Verify createdAt timestamp set
-   [ ] POST /api/categories with missing name
-   [ ] Verify 422 validation error
-   [ ] Verify error message present
-   [ ] POST /api/categories with name over 255 chars
-   [ ] Verify 422 validation error
-   [ ] Create category "Groceries"
-   [ ] POST /api/categories with same name "Groceries"
-   [ ] Verify 409 status code
-   [ ] Verify CATEGORY_EXISTS error code
-   [ ] POST /api/categories without authentication
-   [ ] Verify 401 status code
-   [ ] Run tests: `php artisan test --filter=CategoryControllerStoreTest`

## Notes

-   Controller is interface layer - thin HTTP adapter
-   Delegates all business logic to StoreCategoryAction
-   Request validation via StoreCategoryRequest
-   Entity validation happens in action/entity layer
-   Two layers of validation: HTTP input and domain rules
-   201 status indicates resource creation
-   409 status indicates conflict (duplicate)
-   422 status indicates validation failure
-   Service layer enforces user isolation
-   Cache invalidation handled by repository
-   Response format must match frontend expectations exactly

## Related PRD Sections

-   **Endpoint 2: Create Category:** Lines 231-275
-   **Request Structure:** Lines 236-243
-   **Response Structure:** Lines 250-262
-   **Validation Rules:** Lines 245-249
-   **Error Responses:** Lines 264-267
-   **Business Logic:** Lines 268-275
-   **Layer Architecture - Interface Layer:** Lines 440-450
-   **Error Handling:** Lines 606-623
-   **Exception Hierarchy:** Lines 595-603

## Changelog

| Version | Date       | Changes                                                                                                                                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2024-12-19 | Removed `type` and `isRecurring` properties from category creation. Categories now focus on core properties: name, notes, and timestamps. Updated controller method, request/response structures, and test cases accordingly. |
