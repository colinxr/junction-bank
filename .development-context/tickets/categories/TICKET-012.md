# TICKET-012: DeleteCategory Use Case

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-007  
**PRD Reference:** Lines 335-353, 420-425

## Overview

Implement the DeleteCategoryAction use case that safely deletes categories with dependency checking. This service enforces business rules preventing deletion of categories with associated transactions or recurring transactions, handles cache invalidation, and maintains data integrity per PRD specifications.

## Technical Specifications

### Service Location

`app/Domains/Categories/Actions/DeleteCategoryAction.php`

### Service Structure

```php
namespace App\Domains\Categories\Actions;

use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Exceptions\{
    CategoryNotFoundException,
    CategoryHasTransactionsException
};

class DeleteCategoryAction
{
    public function __construct(
        private ICategoryRepository $repository
    ) {}

    /**
     * Execute the delete category use case
     *
     * @param int $id Category ID
     * @return void
     * @throws CategoryNotFoundException When category not found
     * @throws CategoryHasTransactionsException When category has dependencies
     */
    public function execute(int $id): void
    {
        // Repository handles:
        // 1. Finding category (throws if not found)
        // 2. Checking for transactions
        // 3. Checking for recurring transactions
        // 4. Deletion
        // 5. Cache invalidation
        $this->repository->delete($id);
    }
}
```

### Response (PRD Line 341)

**Success (204):** No content

### Error Handling (PRD Lines 343-353)

**Error Response (404):**

```json
{
    "error": {
        "message": "Category not found",
        "code": "CATEGORY_NOT_FOUND"
    }
}
```

**Error Response (409):**

```json
{
    "error": {
        "message": "Cannot delete category with transactions",
        "code": "CATEGORY_HAS_TRANSACTIONS"
    }
}
```

### Business Logic (PRD Lines 347-353)

1. Find category by ID
2. Check for associated transactions
3. Check for associated recurring transactions
4. Delete if no dependencies
5. Invalidate cache

### Business Rule (PRD Lines 536-541)

**Rule 2: Category Deletion Protection**

-   Cannot delete categories with associated transactions
-   Cannot delete categories with associated recurring transactions
-   Check foreign key constraints before deletion

## Implementation Tasks

1. Create DeleteCategoryAction class
2. Inject repository dependency
3. Implement `execute()` method
4. Delegate all logic to repository delete method
5. Let exceptions bubble up (not found, has transactions)
6. Add comprehensive PHPDoc
7. Write unit tests

## Test Cases

### Happy Path Tests

```php
describe('DeleteCategoryAction Happy Path', function () {
    it('deletes category when no dependencies');
    it('deletes category with no transactions');
    it('deletes category with no recurring transactions');
    it('returns void on successful deletion');
    it('delegates to repository delete method');
});
```

### Not Found Tests

```php
describe('DeleteCategoryAction Not Found', function () {
    it('throws exception when category not found');
    it('throws exception for another users category');
    it('includes category ID in exception message');
    it('propagates exception from repository');
});
```

### Dependency Protection Tests

```php
describe('DeleteCategoryAction Dependency Protection', function () {
    it('throws exception when category has transactions');
    it('throws exception when category has recurring transactions');
    it('throws exception when category has both');
    it('includes helpful error message');
    it('does not delete when dependencies exist');
});
```

### Cache Invalidation Tests

```php
describe('DeleteCategoryAction Cache Invalidation', function () {
    it('invalidates specific category cache');
    it('invalidates list cache after deletion');
    it('invalidates user categories cache');
    it('repository handles cache invalidation');
});
```

### Integration Tests

```php
describe('DeleteCategoryAction Integration', function () {
    it('calls repository delete with ID');
    it('removes category from database');
    it('verifies deletion via findById throws exception');
    it('maintains database integrity');
});
```

### User Isolation Tests

```php
describe('DeleteCategoryAction User Isolation', function () {
    it('throws exception deleting another users category');
    it('only deletes categories for authenticated user');
    it('enforces user isolation via repository');
});
```

### Transaction Dependency Tests

```php
describe('DeleteCategoryAction Transaction Dependencies', function () {
    it('checks for one-time transactions');
    it('checks for recurring transactions');
    it('prevents deletion with any dependencies');
    it('allows deletion after all transactions removed');
});
```

### Edge Case Tests

```php
describe('DeleteCategoryAction Edge Cases', function () {
    it('handles deleting newly created category');
    it('handles deleting category multiple times fails second time');
    it('handles concurrent deletion attempts');
    it('handles ID as zero');
    it('handles negative ID');
});
```

### Exception Handling Tests

```php
describe('DeleteCategoryAction Exception Handling', function () {
    it('propagates CategoryNotFoundException');
    it('propagates CategoryHasTransactionsException');
    it('includes helpful error messages');
    it('does not modify data when exception thrown');
});
```

## Acceptance Criteria

-   [ ] DeleteCategoryAction class created at correct location
-   [ ] Constructor injects repository
-   [ ] `execute()` method implemented
-   [ ] Repository delete called with ID
-   [ ] Dependency checks enforced by repository
-   [ ] CategoryNotFoundException propagated
-   [ ] CategoryHasTransactionsException propagated
-   [ ] Cache invalidation handled by repository
-   [ ] User isolation enforced via repository
-   [ ] No content returned on success
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 30+ test cases pass

## Validation Checklist

-   [ ] Create category with no transactions
-   [ ] Delete category
-   [ ] Verify successful deletion (204)
-   [ ] Attempt to find deleted category
-   [ ] Verify CategoryNotFoundException thrown
-   [ ] Create category and add transaction
-   [ ] Attempt to delete category
-   [ ] Verify CategoryHasTransactionsException thrown
-   [ ] Verify category still exists
-   [ ] Create category and add recurring transaction
-   [ ] Attempt to delete category
-   [ ] Verify CategoryHasTransactionsException thrown
-   [ ] Delete category ID 999 (non-existent)
-   [ ] Verify CategoryNotFoundException thrown
-   [ ] Create category as user A
-   [ ] Attempt to delete as user B
-   [ ] Verify exception thrown (user isolation)
-   [ ] Run tests: `php artisan test --filter=DeleteCategoryActionTest`

## Notes

-   Service is application layer - orchestrates domain and infrastructure
-   Service is thin - delegates all logic to repository
-   Repository enforces business rule for deletion protection
-   Repository checks both transactions and recurring_transactions tables
-   Repository handles cache invalidation automatically
-   User isolation enforced by repository
-   No direct database access in service
-   Delete operation is final - no soft deletes currently
-   Exception messages should be clear and actionable
-   Currently returns false for hasTransactions until Transactions domain exists
-   After Transactions domain: update repository to check actual foreign keys

## Related PRD Sections

-   **Endpoint 5: Delete Category:** Lines 335-353
-   **Use Cases:** Lines 420-425
-   **Business Rule - Deletion Protection:** Lines 536-541
-   **Business Logic:** Lines 347-353
-   **Error Handling:** Lines 343-346, 606-611
-   **Caching Strategy - Invalidation:** Lines 519-525
-   **Exception Hierarchy:** Lines 595-603
-   **Domain Model:** Lines 156-160 (business rules)

## Changelog

| Version | Date       | Changes                                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1.1     | 2024-12-19 | Reviewed for PRD v1.1. No changes required - delete operation is unaffected by removal of `type` and `isRecurring` properties. |
