# TICKET-006: Category Repository Implementation

**Estimate:** 4-5 hours  
**Priority:** Critical  
**Dependencies:** TICKET-002, TICKET-004, TICKET-005  
**PRD Reference:** Lines 431-439, 505-525

## Overview

Implement the concrete CategoryRepository class that fulfills the ICategoryRepository contract. This repository handles all data persistence operations using Eloquent ORM, implements Redis caching for performance, and manages cache invalidation.

## Technical Specifications

### Repository Location

`app/Domains/Categories/Infrastructure/Repositories/CategoryRepository.php`

### Repository Structure

```php
namespace App\Domains\Categories\Infrastructure\Repositories;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Exceptions\{
    CategoryNotFoundException,
    CategoryAlreadyExistsException,
    CategoryHasTransactionsException
};
use App\Domains\Categories\Infrastructure\Cache\CategoryCacheKeys;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Models\Category as CategoryModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CategoryRepository implements ICategoryRepository
{
    public function __construct(
        private CategoryMapper $mapper
    ) {}

    public function findAll(int $page = 1, int $limit = 20, ?string $type = null): array
    {
        // Implementation with caching
    }

    public function findById(int $id): Category
    {
        // Implementation with caching
    }

    public function create(Category $category): Category
    {
        // Implementation with cache invalidation
    }

    public function update(Category $category): Category
    {
        // Implementation with cache invalidation
    }

    public function delete(int $id): void
    {
        // Implementation with dependency checks and cache invalidation
    }

    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        // Implementation
    }

    public function hasTransactions(int $id): bool
    {
        // Implementation - returns false for now (no transactions table yet)
    }

    public function hasRecurringTransactions(int $id): bool
    {
        // Implementation - returns false for now
    }

    private function invalidateCache(int $id, int $userId): void
    {
        // Cache invalidation logic
    }
}
```

### Implementation Details

#### findAll() - Paginated List with Caching

```php
public function findAll(int $page = 1, int $limit = 20, ?string $type = null): array
{
    $userId = auth()->id(); // Get from authenticated user
    $cacheKey = CategoryCacheKeys::list($userId, $page, $limit, $type);
    $ttl = CategoryCacheKeys::getListTTL();

    return Cache::remember($cacheKey, $ttl, function () use ($page, $limit, $type, $userId) {
        $query = CategoryModel::where('user_id', $userId);

        if ($type) {
            $query->where('type', $type);
        }

        $total = $query->count();
        $categories = $query
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return [
            'data' => $categories->map(fn($model) => $this->mapper->toEntity($model))->toArray(),
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => (int) ceil($total / $limit),
                'totalItems' => $total,
                'itemsPerPage' => $limit,
            ]
        ];
    });
}
```

#### findById() - Single Category with Caching

```php
public function findById(int $id): Category
{
    $cacheKey = CategoryCacheKeys::single($id);
    $ttl = CategoryCacheKeys::getSingleTTL();

    $category = Cache::remember($cacheKey, $ttl, function () use ($id) {
        return CategoryModel::find($id);
    });

    if (!$category) {
        throw new CategoryNotFoundException("Category with ID {$id} not found");
    }

    return $this->mapper->toEntity($category);
}
```

#### create() - With Uniqueness Check and Cache Invalidation

```php
public function create(Category $category): Category
{
    if ($this->existsByName($category->getName())) {
        throw new CategoryAlreadyExistsException(
            "Category with name '{$category->getName()}' already exists"
        );
    }

    $model = $this->mapper->toModel($category);
    $model->user_id = auth()->id();
    $model->save();

    $entity = $this->mapper->toEntity($model);

    $this->invalidateCache($model->id, $model->user_id);

    return $entity;
}
```

#### update() - With Uniqueness Check and Cache Invalidation

```php
public function update(Category $category): Category
{
    $model = CategoryModel::find($category->getId());

    if (!$model) {
        throw new CategoryNotFoundException(
            "Category with ID {$category->getId()} not found"
        );
    }

    if ($this->existsByName($category->getName(), $category->getId())) {
        throw new CategoryAlreadyExistsException(
            "Category with name '{$category->getName()}' already exists"
        );
    }

    $model->name = $category->getName();
    $model->type = $category->getType();
    $model->notes = $category->getNotes();
    $model->is_recurring = $category->isRecurring();
    $model->save();

    $entity = $this->mapper->toEntity($model);

    $this->invalidateCache($model->id, $model->user_id);

    return $entity;
}
```

#### delete() - With Dependency Checks

```php
public function delete(int $id): void
{
    $model = CategoryModel::find($id);

    if (!$model) {
        throw new CategoryNotFoundException("Category with ID {$id} not found");
    }

    if ($this->hasTransactions($id)) {
        throw new CategoryHasTransactionsException(
            "Cannot delete category with associated transactions"
        );
    }

    if ($this->hasRecurringTransactions($id)) {
        throw new CategoryHasTransactionsException(
            "Cannot delete category with associated recurring transactions"
        );
    }

    $userId = $model->user_id;
    $model->delete();

    $this->invalidateCache($id, $userId);
}
```

#### existsByName() - Uniqueness Check

```php
public function existsByName(string $name, ?int $excludeId = null): bool
{
    $query = CategoryModel::where('user_id', auth()->id())
        ->where('name', $name);

    if ($excludeId) {
        $query->where('id', '!=', $excludeId);
    }

    return $query->exists();
}
```

#### Cache Invalidation

```php
private function invalidateCache(int $id, int $userId): void
{
    // Invalidate specific category cache
    Cache::forget(CategoryCacheKeys::single($id));

    // Invalidate user's category list cache
    Cache::forget(CategoryCacheKeys::userCategories($userId));

    // Invalidate all paginated list caches for user
    // Note: In production, consider using cache tags or dedicated invalidation strategy
    $pattern = CategoryCacheKeys::listPattern($userId);
    // Implementation depends on cache driver (Redis supports pattern deletion)
}
```

## Implementation Tasks

1. Create CategoryRepository class
2. Inject CategoryMapper dependency
3. Implement findAll with pagination and caching
4. Implement findById with caching
5. Implement create with uniqueness check
6. Implement update with uniqueness check
7. Implement delete with dependency checks
8. Implement existsByName
9. Implement hasTransactions (stub)
10. Implement hasRecurringTransactions (stub)
11. Implement cache invalidation logic
12. Add comprehensive PHPDoc
13. Write unit tests for all methods
14. Write integration tests with database
15. Write cache behavior tests

## Test Cases

### Repository CRUD Tests

```php
describe('CategoryRepository CRUD Operations', function () {
    it('finds all categories with pagination')
    it('finds all categories filtered by type')
    it('finds single category by id')
    it('throws exception when category not found')
    it('creates new category')
    it('throws exception when creating duplicate name')
    it('updates existing category')
    it('throws exception when updating to duplicate name')
    it('allows updating category with same name')
    it('deletes category when no dependencies')
    it('throws exception when deleting non-existent category')
    it('throws exception when category has transactions')
});
```

### Cache Behavior Tests

```php
describe('CategoryRepository Caching', function () {
    it('caches findAll results')
    it('returns cached data on subsequent calls')
    it('invalidates list cache on create')
    it('invalidates list cache on update')
    it('invalidates list cache on delete')
    it('caches findById results')
    it('invalidates specific cache on update')
    it('invalidates specific cache on delete')
    it('respects TTL for list cache')
    it('respects TTL for single category cache')
});
```

### Uniqueness Tests

```php
describe('CategoryRepository Uniqueness', function () {
    it('detects duplicate names')
    it('allows same name for different users')
    it('excludes self when checking uniqueness on update')
    it('is case sensitive for name comparison')
});
```

### Pagination Tests

```php
describe('CategoryRepository Pagination', function () {
    it('returns correct page of results')
    it('calculates total pages correctly')
    it('returns correct pagination metadata')
    it('handles empty results')
    it('respects limit parameter')
});
```

### User Isolation Tests

```php
describe('CategoryRepository User Isolation', function () {
    it('only returns categories for authenticated user')
    it('does not find categories from other users')
    it('scopes uniqueness check to user')
});
```

## Acceptance Criteria

-   [ ] Repository class implements ICategoryRepository
-   [ ] All 8 interface methods implemented
-   [ ] CategoryMapper injected via constructor
-   [ ] Redis caching on read operations
-   [ ] Cache invalidation on write operations
-   [ ] Uniqueness check before create/update
-   [ ] Dependency check before delete
-   [ ] User isolation for all operations
-   [ ] Pagination logic correct
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All integration tests pass
-   [ ] All cache tests pass

## Validation Checklist

-   [ ] Create category via repository
-   [ ] Verify it's cached: check Redis keys
-   [ ] Fetch same category: verify cache hit
-   [ ] Update category: verify cache invalidation
-   [ ] Create duplicate name: verify exception thrown
-   [ ] Test pagination: create 25 categories, fetch page 2
-   [ ] Test filtering: create income/expense, filter each
-   [ ] Run tests: `php artisan test --filter=CategoryRepositoryTest`

## Notes

-   Repository is infrastructure layer, uses Eloquent and Laravel services
-   hasTransactions() returns false until Transactions domain is implemented
-   Cache invalidation by pattern may require Redis-specific code
-   User ID comes from Laravel's auth() helper
-   Consider implementing soft deletes in future
-   Mapper handles entity ↔ model transformation (TICKET-007)

## Related PRD Sections

-   **Repository Implementations:** Lines 431-435
-   **Caching Strategy:** Lines 505-525
-   **Business Rules:** Lines 528-547
-   **Error Handling:** Lines 593-623
