# TICKET-016: Category Controller - Update & Delete

**Estimate:** 2-3 hours  
**Priority:** Critical  
**Dependencies:** TICKET-011, TICKET-012, TICKET-013, TICKET-014  
**PRD Reference:** Lines 301-353, 440-450, 606-623

## Overview

Implement the update() and destroy() methods in CategoryController to handle category modification and deletion through the API. The controller validates input, delegates operations to use case actions, and returns properly formatted responses with correct HTTP status codes and error handling per PRD specifications.

## Technical Specifications

### Controller Methods

Add to existing `app/Http/Controllers/CategoryController.php`

```php
use App\Http\Requests\UpdateCategoryRequest;
use App\Domains\Categories\Actions\{UpdateCategoryAction, DeleteCategoryAction};
use App\Domains\Categories\Exceptions\{
    CategoryNotFoundException,
    CategoryAlreadyExistsException,
    CategoryHasTransactionsException
};

public function __construct(
    private IndexCategoriesService $indexService,
    private ShowCategoryAction $showAction,
    private StoreCategoryAction $storeAction,
    private UpdateCategoryAction $updateAction,
    private DeleteCategoryAction $deleteAction
) {}

/**
 * Update the specified category
 *
 * @param UpdateCategoryRequest $request
 * @param int $id
 * @return JsonResponse
 */
public function update(UpdateCategoryRequest $request, int $id): JsonResponse
{
    try {
        $category = $this->updateAction->execute($id, $request->validated());
        return response()->json(['data' => $category], 200);
    } catch (CategoryNotFoundException $e) {
        return response()->json([
            'error' => [
                'message' => 'Category not found',
                'code' => 'CATEGORY_NOT_FOUND'
            ]
        ], 404);
    } catch (CategoryAlreadyExistsException $e) {
        return response()->json([
            'error' => [
                'message' => 'Category name already exists',
                'code' => 'CATEGORY_EXISTS'
            ]
        ], 409);
    }
}

/**
 * Remove the specified category
 *
 * @param int $id
 * @return JsonResponse
 */
public function destroy(int $id): JsonResponse
{
    try {
        $this->deleteAction->execute($id);
        return response()->json(null, 204);
    } catch (CategoryNotFoundException $e) {
        return response()->json([
            'error' => [
                'message' => 'Category not found',
                'code' => 'CATEGORY_NOT_FOUND'
            ]
        ], 404);
    } catch (CategoryHasTransactionsException $e) {
        return response()->json([
            'error' => [
                'message' => 'Cannot delete category with transactions',
                'code' => 'CATEGORY_HAS_TRANSACTIONS'
            ]
        ], 409);
    }
}
```

### Update Request Structure (PRD Lines 307-313)

```json
{
    "name": "Food & Groceries",
    "notes": "Updated description"
}
```

### Update Response Structure (PRD Lines 320-332)

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

### Delete Response (PRD Line 341)

**Success (204):** No content

### Error Responses (PRD Lines 343-346, 612-623)

**404 Not Found:**

```json
{
    "error": {
        "message": "Category not found",
        "code": "CATEGORY_NOT_FOUND"
    }
}
```

**409 Conflict (Duplicate):**

```json
{
    "error": {
        "message": "Category name already exists",
        "code": "CATEGORY_EXISTS"
    }
}
```

**409 Conflict (Has Dependencies):**

```json
{
    "error": {
        "message": "Cannot delete category with transactions",
        "code": "CATEGORY_HAS_TRANSACTIONS"
    }
}
```

## Implementation Tasks

1. Add UpdateCategoryAction and DeleteCategoryAction to constructor
2. Implement `update()` method
3. Type-hint UpdateCategoryRequest for validation
4. Call UpdateCategoryAction with ID and validated data
5. Handle CategoryNotFoundException (404)
6. Handle CategoryAlreadyExistsException (409)
7. Return 200 with updated category
8. Implement `destroy()` method
9. Call DeleteCategoryAction with ID
10. Handle CategoryHasTransactionsException (409)
11. Return 204 on successful deletion
12. Add PHPDoc documentation
13. Write integration tests

## Test Cases

### Update Method Happy Path Tests

```php
describe('CategoryController Update Happy Path', function () {
    it('updates category with all fields');
    it('updates category with partial fields');
    it('updates only name');
    it('updates only type');
    it('updates only notes');
    it('updates to null notes');
    it('returns 200 status code');
    it('wraps updated category in data key');
    it('delegates to UpdateCategoryAction');
    it('passes ID and validated data to action');
});
```

### Update Validation Tests

```php
describe('CategoryController Update Validation', function () {
    it('validates using UpdateCategoryRequest');
    it('returns 422 when name exceeds 255 characters');
    it('returns 422 when type is invalid');
    it('returns 422 when notes exceed 1000 characters');
    it('allows partial updates via sometimes rules');
    it('returns validation errors in standard format');
});
```

### Update Error Handling Tests

```php
describe('CategoryController Update Error Handling', function () {
    it('returns 404 when category not found');
    it('returns 409 when new name already exists');
    it('catches CategoryNotFoundException');
    it('catches CategoryAlreadyExistsException');
    it('returns error object with message');
    it('returns error object with code');
    it('formats errors per PRD specification');
});
```

### Update Response Format Tests

```php
describe('CategoryController Update Response Format', function () {
    it('includes all category fields');
    it('formats dates as ISO 8601');
    it('uses camelCase for property names');
    it('preserves unchanged fields');
    it('preserves ID and createdAt');
    it('reflects updated values');
});
```

### Destroy Method Happy Path Tests

```php
describe('CategoryController Destroy Happy Path', function () {
    it('deletes category when no dependencies');
    it('returns 204 status code');
    it('returns no content');
    it('delegates to DeleteCategoryAction');
    it('passes ID to action');
    it('removes category from database');
});
```

### Destroy Error Handling Tests

```php
describe('CategoryController Destroy Error Handling', function () {
    it('returns 404 when category not found');
    it('returns 409 when category has transactions');
    it('returns 409 when category has recurring transactions');
    it('catches CategoryNotFoundException');
    it('catches CategoryHasTransactionsException');
    it('returns error object with message');
    it('returns error object with code');
    it('formats errors per PRD specification');
    it('does not delete when dependencies exist');
});
```

### Authentication Tests

```php
describe('CategoryController Update Delete Authentication', function () {
    it('requires authentication for update');
    it('requires authentication for destroy');
    it('returns 401 when not authenticated');
    it('enforces auth via middleware');
});
```

### User Isolation Tests

```php
describe('CategoryController Update Delete User Isolation', function () {
    it('returns 404 updating another users category');
    it('returns 404 deleting another users category');
    it('enforces user isolation via service layer');
    it('allows updating own categories only');
    it('allows deleting own categories only');
});
```

### Integration Tests

```php
describe('CategoryController Update Delete Integration', function () {
    it('integrates with UpdateCategoryAction correctly');
    it('integrates with DeleteCategoryAction correctly');
    it('integrates with UpdateCategoryRequest validation');
    it('persists updates to database');
    it('removes deleted categories from database');
    it('invalidates cache after update');
    it('invalidates cache after delete');
    it('returns consistent response structures');
});
```

### Edge Case Tests

```php
describe('CategoryController Update Delete Edge Cases', function () {
    it('handles updating with no changes');
    it('handles updating multiple times consecutively');
    it('handles deleting already deleted category');
    it('handles concurrent update attempts');
    it('handles concurrent delete attempts');
    it('handles update after delete fails');
    it('handles unicode characters in updates');
});
```

### Partial Update Tests

```php
describe('CategoryController Partial Update', function () {
    it('updates only provided fields');
    it('preserves fields not in request');
    it('handles empty update data');
    it('validates only provided fields');
    it('allows changing name without type');
    it('allows changing type without name');
});
```

## Acceptance Criteria

-   [ ] `update()` method implemented in CategoryController
-   [ ] `destroy()` method implemented in CategoryController
-   [ ] Constructor injects UpdateCategoryAction and DeleteCategoryAction
-   [ ] UpdateCategoryRequest type-hinted for validation
-   [ ] Update delegates to UpdateCategoryAction
-   [ ] Delete delegates to DeleteCategoryAction
-   [ ] CategoryNotFoundException handled (404)
-   [ ] CategoryAlreadyExistsException handled (409)
-   [ ] CategoryHasTransactionsException handled (409)
-   [ ] Response formats match PRD specification
-   [ ] Status codes correct (200, 204, 404, 409)
-   [ ] Error formats match PRD specification
-   [ ] PHPDoc on all methods
-   [ ] 100% test coverage
-   [ ] All 55+ test cases pass

## Validation Checklist

-   [ ] Create category "Groceries"
-   [ ] PUT /api/categories/1 with new name "Food"
-   [ ] Verify 200 status code
-   [ ] Verify name updated, other fields preserved
-   [ ] PUT /api/categories/999 (non-existent)
-   [ ] Verify 404 status code
-   [ ] Create second category "Entertainment"
-   [ ] PUT /api/categories/1 with name "Entertainment"
-   [ ] Verify 409 status code
-   [ ] Verify CATEGORY_EXISTS error code
-   [ ] PUT /api/categories/1 with name over 255 chars
-   [ ] Verify 422 validation error
-   [ ] DELETE /api/categories/1 (no transactions)
-   [ ] Verify 204 status code
-   [ ] Verify category deleted
-   [ ] Create category and add transaction
-   [ ] DELETE /api/categories/2
-   [ ] Verify 409 status code
-   [ ] Verify CATEGORY_HAS_TRANSACTIONS error code
-   [ ] DELETE /api/categories/999 (non-existent)
-   [ ] Verify 404 status code
-   [ ] Run tests: `php artisan test --filter=CategoryControllerUpdateDeleteTest`

## Notes

-   Controller is interface layer - thin HTTP adapter
-   Delegates all business logic to action services
-   Update supports partial updates
-   Update validates only provided fields
-   Delete enforces business rule protection
-   204 status returns no content
-   Multiple exception types require careful handling
-   Service layer enforces user isolation
-   Cache invalidation handled by repository
-   Response formats must match frontend expectations exactly
-   Preserve unchanged fields in update
-   Business rules enforced in domain layer

## Related PRD Sections

-   **Endpoint 4: Update Category:** Lines 301-333
-   **Endpoint 5: Delete Category:** Lines 335-353
-   **Validation Rules (Update):** Lines 315-319
-   **Business Logic (Delete):** Lines 347-353
-   **Error Handling:** Lines 606-623
-   **Business Rule - Deletion Protection:** Lines 536-541
-   **Layer Architecture - Interface Layer:** Lines 440-450
-   **Exception Hierarchy:** Lines 595-603

-   what should happen to transactions when their category is deleted?
