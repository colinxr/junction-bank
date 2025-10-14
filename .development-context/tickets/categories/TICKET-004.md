# TICKET-004: Repository Interface

**Estimate:** 1-2 hours  
**Priority:** Critical  
**Dependencies:** TICKET-003  
**PRD Reference:** Lines 412-416, 430-439

## Overview

Define the repository interface contract that abstracts data persistence operations for the Category domain. This interface is part of the domain layer and will be implemented in the infrastructure layer.

## Technical Specifications

### Interface Location

`app/Domains/Categories/Repositories/ICategoryRepository.php`

### Interface Definition

```php
namespace App\Domains\Categories\Repositories;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\CategoryNotFoundException;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;

/**
 * Category Repository Interface
 *
 * Defines the contract for category data persistence operations.
 * Implementations should handle database operations and caching.
 */
interface ICategoryRepository
{
    /**
     * Find all categories with optional filtering and pagination
     *
     * @param int $page Page number (1-indexed)
     * @param int $limit Items per page
     * @param string|null $type Filter by type ('income' or 'expense')
     * @return array{data: Category[], pagination: array}
     */
    public function findAll(int $page = 1, int $limit = 20, ?string $type = null): array;

    /**
     * Find category by ID
     *
     * @param int $id Category ID
     * @return Category
     * @throws CategoryNotFoundException
     */
    public function findById(int $id): Category;

    /**
     * Create a new category
     *
     * @param Category $category Category entity to persist
     * @return Category Persisted category with ID
     * @throws CategoryAlreadyExistsException If name already exists
     */
    public function create(Category $category): Category;

    /**
     * Update existing category
     *
     * @param Category $category Category entity with changes
     * @return Category Updated category
     * @throws CategoryNotFoundException
     * @throws CategoryAlreadyExistsException If new name conflicts
     */
    public function update(Category $category): Category;

    /**
     * Delete category by ID
     *
     * @param int $id Category ID
     * @return void
     * @throws CategoryNotFoundException
     * @throws CategoryHasTransactionsException If has dependencies
     */
    public function delete(int $id): void;

    /**
     * Check if category name already exists
     *
     * @param string $name Category name to check
     * @param int|null $excludeId ID to exclude from check (for updates)
     * @return bool
     */
    public function existsByName(string $name, ?int $excludeId = null): bool;

    /**
     * Check if category has associated transactions
     *
     * @param int $id Category ID
     * @return bool
     */
    public function hasTransactions(int $id): bool;

    /**
     * Check if category has associated recurring transactions
     *
     * @param int $id Category ID
     * @return bool
     */
    public function hasRecurringTransactions(int $id): bool;
}
```

### Method Specifications

#### findAll()

-   **Purpose:** Retrieve paginated list of categories
-   **Parameters:** page (int), limit (int), type (string|null)
-   **Returns:** Array with 'data' (Category[]) and 'pagination' metadata
-   **Cache Strategy:** Cache by page/limit/type combination

#### findById()

-   **Purpose:** Retrieve single category by ID
-   **Parameters:** id (int)
-   **Returns:** Category entity
-   **Throws:** CategoryNotFoundException if not found
-   **Cache Strategy:** Cache by ID

#### create()

-   **Purpose:** Persist new category
-   **Parameters:** Category entity (without ID)
-   **Returns:** Category entity (with ID assigned)
-   **Throws:** CategoryAlreadyExistsException if name exists
-   **Cache Strategy:** Invalidate list caches

#### update()

-   **Purpose:** Update existing category
-   **Parameters:** Category entity (with ID)
-   **Returns:** Updated Category entity
-   **Throws:** CategoryNotFoundException, CategoryAlreadyExistsException
-   **Cache Strategy:** Invalidate specific category and list caches

#### delete()

-   **Purpose:** Remove category
-   **Parameters:** id (int)
-   **Returns:** void
-   **Throws:** CategoryNotFoundException, CategoryHasTransactionsException
-   **Cache Strategy:** Invalidate specific category and list caches

#### existsByName()

-   **Purpose:** Check name uniqueness
-   **Parameters:** name (string), excludeId (int|null)
-   **Returns:** boolean
-   **Note:** excludeId used for updates to exclude self

#### hasTransactions()

-   **Purpose:** Check if category has dependent transactions
-   **Parameters:** id (int)
-   **Returns:** boolean
-   **Note:** Used before deletion

#### hasRecurringTransactions()

-   **Purpose:** Check if category has dependent recurring transactions
-   **Parameters:** id (int)
-   **Returns:** boolean
-   **Note:** Used before deletion

## Implementation Tasks

1. Create interface file with namespace
2. Add all method signatures with type hints
3. Add comprehensive PHPDoc blocks
4. Document exceptions
5. Document return types
6. Add usage examples in comments
7. Create interface test (stub implementation test)

## Test Cases

### Interface Tests

```php
describe('ICategoryRepository Interface', function () {
    it('defines findAll method with correct signature')
    it('defines findById method with correct signature')
    it('defines create method with correct signature')
    it('defines update method with correct signature')
    it('defines delete method with correct signature')
    it('defines existsByName method with correct signature')
    it('defines hasTransactions method with correct signature')
    it('defines hasRecurringTransactions method with correct signature')
    it('can be implemented by concrete classes')
});
```

## Acceptance Criteria

-   [ ] Interface created at correct location
-   [ ] All 8 methods defined with signatures
-   [ ] Type hints on all parameters
-   [ ] Return type declarations on all methods
-   [ ] PHPDoc blocks on all methods
-   [ ] Exceptions documented in PHPDoc
-   [ ] Namespace properly defined
-   [ ] Imports for Category entity and exceptions
-   [ ] Interface can be type-hinted in constructors
-   [ ] All test cases pass

## Validation Checklist

-   [ ] Interface file exists and is properly namespaced
-   [ ] Can be imported: `use App\Domains\Categories\Repositories\ICategoryRepository;`
-   [ ] Type-hint works: `public function __construct(ICategoryRepository $repo)`
-   [ ] PHPStan passes with no errors
-   [ ] IDE recognizes all methods and provides autocomplete

## Notes

-   This is a domain layer interface (not infrastructure)
-   Keep it framework-agnostic (no Laravel-specific code)
-   Focus on domain concepts (Category entity), not infrastructure (Eloquent models)
-   Will be bound to implementation via dependency injection in AppServiceProvider
-   Implementation will be done in TICKET-006

## Related PRD Sections

-   **Repository Interfaces:** Lines 412-416
-   **Repository Implementations:** Lines 431-435
-   **Dependency Injection:** Lines 465-484
-   **Business Rules:** Lines 528-547
