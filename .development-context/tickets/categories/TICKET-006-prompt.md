# Development Plan: TICKET-006 Category Repository Implementation

## Branch Name

```
feature/category-repository-implementation
```

## TDD Commit Sequence

### Phase 1: Foundation & Service Provider

```
2. feat: create CategoryServiceProvider with basic structure
   - Create provider class
   - Add register() method stub
   - Add boot() method with conditional loading
   - Register in AppServiceProvider

3. test: add CategoryMapper binding tests
   - Test CategoryMapper resolves from container
   - Test CategoryMapper is bound correctly

4. feat: bind CategoryMapper in service provider
   - Add CategoryMapper::class binding in register()
```

### Phase 2: Repository Structure & FindById

```
5. test: add CategoryRepository binding tests
   - Test ICategoryRepository resolves from container
   - Test resolved instance is CategoryRepository
   - Test CategoryMapper injected correctly

6. feat: create CategoryRepository skeleton
   - Create class with constructor
   - Inject CategoryMapper dependency
   - Add method stubs for all 8 interface methods

7. test: add findById() tests
   - Test finds existing category
   - Test throws CategoryNotFoundException for non-existent
   - Test returns correct entity type
   - Test user isolation

8. feat: implement findById() method
   - Query CategoryModel by ID
   - Throw exception if not found
   - Map model to entity using mapper
```

### Phase 3: Uniqueness Checks

```
9. test: add existsByName() tests
   - Test detects existing name
   - Test returns false for non-existent name
   - Test case sensitivity
   - Test excludeId parameter works
   - Test user scoping

10. feat: implement existsByName() method
    - Query by name
    - Handle excludeId parameter
    - Return boolean result
```

### Phase 4: Create Operation

```
11. test: add create() tests
    - Test creates new category
    - Test throws CategoryAlreadyExistsException for duplicate
    - Test returns entity with generated ID
    - Test mapper integration

12. feat: implement create() method
    - Check uniqueness via existsByName()
    - Map entity to model
    - Save model
    - Return mapped entity
```

### Phase 5: Update Operation

```
13. test: add update() tests
    - Test updates existing category
    - Test throws CategoryNotFoundException for non-existent
    - Test throws CategoryAlreadyExistsException for duplicate
    - Test allows updating with same name
    - Test all fields update correctly

14. feat: implement update() method
    - Find existing model
    - Check uniqueness (excluding self)
    - Update model fields
    - Save changes
    - Return mapped entity
```

### Phase 6: Dependency Checks

```
15. test: add hasTransactions() tests
    - Test returns false (stub implementation)
    - Document future behavior in test

16. feat: implement hasTransactions() stub
    - Return false
    - Add TODO comment for future implementation

17. test: add hasRecurringTransactions() tests
    - Test returns false (stub implementation)
    - Document future behavior in test

18. feat: implement hasRecurringTransactions() stub
    - Return false
    - Add TODO comment for future implementation
```

### Phase 7: Delete Operation

```
19. test: add delete() tests
    - Test deletes category without dependencies
    - Test throws CategoryNotFoundException for non-existent
    - Test throws CategoryHasTransactionsException when hasTransactions
    - Test throws CategoryHasTransactionsException when hasRecurringTransactions
    - Test category removed from database

20. feat: implement delete() method
    - Find model by ID
    - Check hasTransactions()
    - Check hasRecurringTransactions()
    - Delete model
```

### Phase 8: Pagination & Filtering

```
21. test: add findAll() tests
    - Test returns paginated results
    - Test filters by type
    - Test pagination metadata correct
    - Test sorts by created_at desc
    - Test user isolation
    - Test empty results
    - Test page boundaries

22. feat: implement findAll() method
    - Apply type filter if provided
    - Calculate total count
    - Apply pagination (skip/take)
    - Order by created_at desc
    - Map models to entities
    - Return data + pagination metadata
```

### Phase 9: Integration & Documentation

```
23. test: add integration tests for full workflow
    - Test create → update → delete flow
    - Test pagination with multiple pages
    - Test concurrent uniqueness checks
    - Test cross-user isolation

24. docs: add comprehensive PHPDoc to all methods
    - Document parameters
    - Document return types
    - Document thrown exceptions
    - Add usage examples
```

### Phase 10: Validation

```
25. test: run full test suite and verify coverage
    - Ensure 100% coverage of CategoryRepository
    - Ensure all acceptance criteria met
    - Run phpstan analysis

26. chore: update TICKET-006 with completion status
    - Check all acceptance criteria boxes
    - Add any implementation notes
```

## Pull Request Body

````markdown
# Category Repository Implementation

**Ticket:** TICKET-006  
**Estimate:** 3-4 hours  
**Dependencies:** TICKET-002 (Entity), TICKET-004 (Exceptions), TICKET-005 (Interface)

## Overview

Implements the concrete `CategoryRepository` class fulfilling the `ICategoryRepository` contract. Includes full CRUD operations with uniqueness validation, dependency checks, pagination, and user isolation.

## Changes

### New Files

-   `app/Domains/Categories/Providers/CategoryServiceProvider.php` - Domain service provider
-   `app/Domains/Categories/Infrastructure/Repositories/CategoryRepository.php` - Repository implementation
-   `tests/Unit/CategoryRepositoryTest.php` - Unit tests
-   `tests/Integration/CategoryRepositoryIntegrationTest.php` - Integration tests
-   `tests/Unit/CategoryServiceProviderTest.php` - Provider tests

### Modified Files

-   `app/Providers/AppServiceProvider.php` - Registered CategoryServiceProvider

## Implementation Details

### CategoryServiceProvider

-   Binds `CategoryMapper` to container
-   Binds `ICategoryRepository` → `CategoryRepository`
-   Conditionally loads routes, config, views
-   Registered in `AppServiceProvider`

### CategoryRepository Methods

| Method                       | Description                        | Status                  |
| ---------------------------- | ---------------------------------- | ----------------------- |
| `findAll()`                  | Paginated list with type filtering | ✅ Implemented          |
| `findById()`                 | Single category lookup             | ✅ Implemented          |
| `create()`                   | Create with uniqueness check       | ✅ Implemented          |
| `update()`                   | Update with uniqueness check       | ✅ Implemented          |
| `delete()`                   | Delete with dependency check       | ✅ Implemented          |
| `existsByName()`             | Uniqueness validation              | ✅ Implemented          |
| `hasTransactions()`          | Transaction check                  | ⏳ Stub (returns false) |
| `hasRecurringTransactions()` | Recurring check                    | ⏳ Stub (returns false) |

### Key Features

-   ✅ User isolation on all operations
-   ✅ Uniqueness validation (case-sensitive)
-   ✅ Pagination with metadata
-   ✅ Type filtering (income/expense)
-   ✅ Dependency protection on delete
-   ✅ CategoryMapper integration
-   ✅ Comprehensive error handling

### Stubs for Future Implementation

-   `hasTransactions()` - Returns `false` until Transactions domain exists
-   `hasRecurringTransactions()` - Returns `false` until RecurringTransactions domain exists

## Testing

### Test Coverage

-   **Unit Tests:** 100% method coverage
-   **Integration Tests:** Full CRUD workflow
-   **User Isolation Tests:** Cross-user scenarios
-   **Uniqueness Tests:** Duplicate detection
-   **Pagination Tests:** Multi-page scenarios

### Running Tests

```bash
php artisan test --filter=CategoryRepositoryTest
php artisan test --filter=CategoryServiceProviderTest
php artisan test --filter=CategoryRepositoryIntegrationTest
```
````

### PHPStan Analysis

```bash
./vendor/bin/phpstan analyse app/Domains/Categories
```

## Acceptance Criteria

-   [x] CategoryServiceProvider created and registered
-   [x] CategoryServiceProvider registered in AppServiceProvider
-   [x] Repository implements ICategoryRepository
-   [x] All 8 interface methods implemented
-   [x] CategoryMapper injected via constructor
-   [x] Uniqueness check before create/update
-   [x] Dependency check before delete
-   [x] User isolation for all operations
-   [x] Pagination logic correct
-   [x] PHPDoc on all methods
-   [x] 100% unit test coverage
-   [x] All integration tests pass

## Manual Validation

```bash
# 1. Verify container bindings
php artisan tinker
>>> app(App\Domains\Categories\Repositories\ICategoryRepository::class)

# 2. Create category
>>> $repo = app(App\Domains\Categories\Repositories\ICategoryRepository::class);
>>> $category = new App\Domains\Categories\Entities\Category(null, 'Groceries', 'expense', 'Food shopping', false);
>>> $created = $repo->create($category);

# 3. Fetch by ID
>>> $fetched = $repo->findById($created->getId());

# 4. Update category
>>> $updated = $fetched->updateName('Groceries & Food');
>>> $repo->update($updated);

# 5. Test duplicate (should throw)
>>> $duplicate = new App\Domains\Categories\Entities\Category(null, 'Groceries & Food', 'expense', '', false);
>>> $repo->create($duplicate); // CategoryAlreadyExistsException

# 6. Test pagination
>>> $result = $repo->findAll(1, 10);
>>> $result['pagination']
```

## Architecture Notes

-   **Stateless Design:** Both `CategoryMapper` and `CategoryRepository` are stateless (see `.development-context/guides/determining-statefulness.md`)
-   **Binding Strategy:** Using `bind()` instead of `singleton()` for better testability and per-request isolation
-   **Service Provider Pattern:** Centralizes all category domain registrations for future extensibility
-   **Mapper Pattern:** Separates entity ↔ model transformation logic

## Next Steps

-   **TICKET-006.1:** Implement Redis caching layer
-   **TICKET-007:** Implement CategoryMapper (if not already done)
-   **Future:** Replace stub methods when Transactions domain implemented

## Related Documentation

-   PRD: Lines 431-439 (Repository Implementations)
-   PRD: Lines 528-547 (Business Rules)
-   PRD: Lines 593-623 (Error Handling)
-   PRD: Lines 464-485 (Dependency Injection)

```

---

## Development Execution Notes

**TDD Approach:**
- Each feature commit preceded by test commit
- Tests define expected behavior before implementation
- Red → Green → Refactor cycle

**Commit Granularity:**
- Average 2 commits per method (test + implementation)
- Service provider setup split into 4 commits
- Integration/documentation phase separate

**Branch Strategy:**
- Feature branch from `laravel-v1`
- Squash merge not recommended (preserve TDD history)
- All tests must pass before PR approval
```
