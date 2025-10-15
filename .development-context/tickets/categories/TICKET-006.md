# TICKET-006: Category Repository Implementation

**Estimate:** 3-4 hours  
**Priority:** Critical  
**Dependencies:** TICKET-002, TICKET-004, TICKET-005  
**PRD Reference:** Lines 431-439

## Overview

Implement the concrete CategoryRepository class that fulfills the ICategoryRepository contract. This repository handles all data persistence operations using Eloquent ORM with basic CRUD functionality, uniqueness validation, and dependency checks.

## Technical Specifications

### Service Provider Location

`app/Domains/Categories/Providers/CategoryServiceProvider.php`

### Repository Location

`app/Domains/Categories/Infrastructure/Repositories/CategoryRepository.php`

### CategoryServiceProvider Structure

```php
namespace App\Domains\Categories\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Repositories\CategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;

class CategoryServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register CategoryMapper
        $this->app->bind(CategoryMapper::class);

        // Register CategoryRepository
        $this->app->bind(ICategoryRepository::class, function ($app) {
            return new CategoryRepository(
                $app->make(CategoryMapper::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load category routes if they exist
        if (file_exists(base_path('app/Domains/Categories/routes/api.php'))) {
            $this->loadRoutesFrom(base_path('app/Domains/Categories/routes/api.php'));
        }

        // Load category configuration if it exists
        if (file_exists(base_path('app/Domains/Categories/config/categories.php'))) {
            $this->mergeConfigFrom(
                base_path('app/Domains/Categories/config/categories.php'),
                'categories'
            );
        }

        // Load category views if they exist
        if (is_dir(base_path('app/Domains/Categories/Resources/views'))) {
            $this->loadViewsFrom(
                base_path('app/Domains/Categories/Resources/views'),
                'categories'
            );
        }
    }
}
```

### AppServiceProvider Registration

```php
// In app/Providers/AppServiceProvider.php
use App\Domains\Categories\Providers\CategoryServiceProvider;

public function register(): void
{
    // Register domain service providers
    $this->app->register(CategoryServiceProvider::class);
}
```

### CategoryMapper Structure

```php
namespace App\Domains\Categories\Infrastructure\Mappers;

use App\Domains\Categories\Entities\Category;
use App\Models\Category as CategoryModel;
use Carbon\Carbon;

class CategoryMapper
{
    /**
     * Convert database model to domain entity
     */
    public function toEntity(CategoryModel $model): Category
    {
        return new Category(
            id: $model->id,
            name: $model->name,
            notes: $model->notes ?? '',
            createdAt: $model->created_at ? Carbon::parse($model->created_at) : null,
            updatedAt: $model->updated_at ? Carbon::parse($model->updated_at) : null
        );
    }

    /**
     * Convert domain entity to database model
     */
    public function toModel(Category $category): CategoryModel
    {
        $model = new CategoryModel();

        if ($category->getId()) {
            $model->id = $category->getId();
        }

        $model->name = $category->getName();
        $model->notes = $category->getNotes();

        if ($category->getCreatedAt()) {
            $model->created_at = $category->getCreatedAt();
        }

        if ($category->getUpdatedAt()) {
            $model->updated_at = $category->getUpdatedAt();
        }

        return $model;
    }

    /**
     * Convert array of models to array of entities
     */
    public function toEntityArray(array $models): array
    {
        return array_map(
            fn(CategoryModel $model) => $this->toEntity($model),
            $models
        );
    }

    /**
     * Convert collection of models to array of entities
     */
    public function toEntityCollection($collection): array
    {
        return $collection->map(
            fn(CategoryModel $model) => $this->toEntity($model)
        )->toArray();
    }
}
```

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
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Models\Category as CategoryModel;
use Illuminate\Support\Facades\DB;

class CategoryRepository implements ICategoryRepository
{
    public function __construct(
        private CategoryMapper $mapper
    ) {}

    public function findAll(int $page = 1, int $limit = 20): array
    {
        // Implementation with pagination

    public function findById(int $id): Category
    {
        // Implementation
    }

    public function create(Category $category): Category
    {
        // Implementation with uniqueness check
    }

    public function update(Category $category): Category
    {
        // Implementation with uniqueness check
    }

    public function delete(int $id): void
    {
        // Implementation with dependency checks
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
}
```

### Implementation Details

#### findAll() - Paginated List

```php
public function findAll(int $page = 1, int $limit = 20): array
{
    $query = CategoryModel::query();

    $total = $query->count();
    $categories = $query
        ->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $limit)
        ->take($limit)
        ->get();

    return [
        'data' => $this->mapper->toEntityCollection($categories),
        'pagination' => [
            'currentPage' => $page,
            'totalPages' => (int) ceil($total / $limit),
            'totalItems' => $total,
            'itemsPerPage' => $limit,
        ]
    ];
}
```

#### findById() - Single Category

```php
public function findById(int $id): Category
{
    $model = CategoryModel::find($id);

    if (!$model) {
        throw new CategoryNotFoundException("Category with ID {$id} not found");
    }

    return $this->mapper->toEntity($model);
}
```

#### create() - With Uniqueness Check

```php
public function create(Category $category): Category
{
    if ($this->existsByName($category->getName())) {
        throw new CategoryAlreadyExistsException(
            "Category with name '{$category->getName()}' already exists"
        );
    }

    $model = $this->mapper->toModel($category);
    $model->save();

    return $this->mapper->toEntity($model);
}
```

#### update() - With Uniqueness Check

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

    // Update model fields from entity
    $model->name = $category->getName();
    $model->notes = $category->getNotes();
    $model->save();

    return $this->mapper->toEntity($model);
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

    $model->delete();
}
```

#### existsByName() - Uniqueness Check

```php
public function existsByName(string $name, ?int $excludeId = null): bool
{
    $query = CategoryModel::where('name', $name);

    if ($excludeId) {
        $query->where('id', '!=', $excludeId);
    }

    return $query->exists();
}
```

## Implementation Tasks

1. Create CategoryServiceProvider class
2. Register CategoryServiceProvider in AppServiceProvider
3. Create CategoryMapper class
4. Implement CategoryMapper::toEntity() method
5. Implement CategoryMapper::toModel() method
6. Implement CategoryMapper::toEntityArray() method
7. Implement CategoryMapper::toEntityCollection() method
8. Create CategoryRepository class
9. Inject CategoryMapper dependency
10. Implement findAll with pagination
11. Implement findById
12. Implement create with uniqueness check
13. Implement update with uniqueness check
14. Implement delete with dependency checks
15. Implement existsByName
16. Implement hasTransactions (stub)
17. Implement hasRecurringTransactions (stub)
18. Add comprehensive PHPDoc
19. Write unit tests for CategoryMapper
20. Write unit tests for CategoryRepository
21. Write integration tests with database

## Test Cases

### CategoryMapper Tests

```php
describe('CategoryMapper', function () {
    it('converts model to entity correctly')
    it('converts entity to model correctly')
    it('handles null timestamps in toEntity')
    it('handles null ID in toModel')
    it('converts array of models to entities')
    it('converts collection of models to entities')
    it('preserves all entity properties in conversion')
    it('handles empty notes field')
});
```

### Repository CRUD Tests

```php
describe('CategoryRepository CRUD Operations', function () {
    it('finds all categories with pagination')
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

### Uniqueness Tests

```php
describe('CategoryRepository Uniqueness', function () {
    it('detects duplicate names')
    it('allows same name for different users')
    it('excludes self when checking uniqueness on update')
    it('is case sensitive for name comparison')
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

-   [ ] CategoryServiceProvider created and registered
-   [ ] CategoryServiceProvider registered in AppServiceProvider
-   [ ] CategoryMapper class created with all methods
-   [ ] CategoryMapper registered in service provider
-   [ ] Repository class implements ICategoryRepository
-   [ ] All 8 interface methods implemented
-   [ ] CategoryMapper injected via constructor
-   [ ] Uniqueness check before create/update
-   [ ] Dependency check before delete
-   [ ] User isolation for all operations
-   [ ] Pagination logic correct
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage for CategoryMapper
-   [ ] 100% unit test coverage for CategoryRepository
-   [ ] All integration tests pass

## Validation Checklist

-   [ ] CategoryServiceProvider loads without errors
-   [ ] Container bindings resolve correctly
-   [ ] CategoryMapper resolves from container
-   [ ] Test CategoryMapper::toEntity() with sample model
-   [ ] Test CategoryMapper::toModel() with sample entity
-   [ ] Test CategoryMapper::toEntityCollection() with collection
-   [ ] Create category via repository
-   [ ] Fetch category by ID: verify correct data returned
-   [ ] Update category: verify changes persisted
-   [ ] Create duplicate name: verify exception thrown
-   [ ] Test pagination: create 25 categories, fetch page 2
-   [ ] Run tests: `php artisan test --filter=CategoryMapperTest`
-   [ ] Run tests: `php artisan test --filter=CategoryRepositoryTest`
-   [ ] Run tests: `php artisan test --filter=CategoryServiceProviderTest`

## Notes

-   CategoryServiceProvider centralizes all category domain registrations
-   Repository is infrastructure layer, uses Eloquent and Laravel services
-   CategoryMapper handles entity ↔ model transformation with proper type handling
-   CategoryMapper includes helper methods for bulk conversions (arrays/collections)
-   CategoryMapper handles null values gracefully (timestamps, notes, ID)
-   hasTransactions() returns false until Transactions domain is implemented
-   User ID comes from Laravel's auth() helper
-   Consider implementing soft deletes in future
-   Caching will be implemented in TICKET-006.1
-   Service provider pattern allows for better organization and future extensibility
-   Both CategoryMapper and CategoryRepository are stateless classes (no mutable state)
-   Using `bind()` instead of `singleton()` for better testability and isolation
-   See `.development-context/guides/determining-statefulness.md` for state analysis guide

## Changelog

| Version | Date       | Author   | Changes                                                                                                                   |
| ------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2024-12-19 | Dev Team | Removed type filtering from `findAll()` method per PRD simplification - categories no longer support type-based filtering |

## Related PRD Sections

### Repository Implementations

**Repository Implementations:**

-   CategoryRepository: Eloquent implementation with Redis caching

**External Services:**

-   None

**Mappers:**

-   CategoryMapper: Entity ↔ Database model transformation

### Business Rules

#### Rule 1: Unique Category Names

**Description:** Each category name must be unique within the system  
**Triggers:** Create and update operations  
**Implementation:** Database unique constraint + application validation  
**Exceptions:** None

#### Rule 2: Category Deletion Protection

**Description:** Cannot delete categories with associated transactions or recurring transactions  
**Triggers:** Delete operation  
**Implementation:** Check foreign key constraints before deletion  
**Exceptions:** None

### Error Handling

#### Exception Hierarchy

```
CategoryException
├── CategoryNotFoundException
├── CategoryAlreadyExistsException
├── CategoryHasTransactionsException
└── CategoryNameEmptyException
```

#### Error Codes

| Code                      | Exception                        | HTTP Status | Message                                  |
| ------------------------- | -------------------------------- | ----------- | ---------------------------------------- |
| CATEGORY_NOT_FOUND        | CategoryNotFoundException        | 404         | Category not found                       |
| CATEGORY_EXISTS           | CategoryAlreadyExistsException   | 409         | Category name already exists             |
| CATEGORY_HAS_TRANSACTIONS | CategoryHasTransactionsException | 409         | Cannot delete category with transactions |

#### Error Response Format

```json
{
    "error": {
        "message": "Category name already exists",
        "code": "CATEGORY_EXISTS",
        "details": {
            "name": ["The name has already been taken."]
        }
    }
}
```

### Validation Rules (Lines 550-590)

#### Entity Validation (Domain Layer)

```php
class Category {
    private function validate(): void {
        // Name validation
        if (empty($this->name)) {
            throw new CategoryNameEmptyException('Category name is required');
        }

        if (strlen($this->name) > 255) {
            throw new InvalidCategoryNameException('Category name too long');
        }

        // Notes validation
        if ($this->notes && strlen($this->notes) > 1000) {
            throw new InvalidCategoryNotesException('Category notes too long');
        }
    }
}
```

#### Input Validation (Form Requests)

```php
class StoreCategoryRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|max:255|unique:categories,name',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
```

### Dependency Injection (Lines 464-485)

#### Service Bindings (Moved to CategoryServiceProvider)

```php
// In CategoryServiceProvider
// Both are stateless, so use bind() for per-request instances
$this->app->bind(CategoryMapper::class);

$this->app->bind(ICategoryRepository::class, function ($app) {
    return new CategoryRepository(
        $app->make(CategoryMapper::class)
    );
});
```

#### Action/Service Bindings (Future Implementation)

```php
// In CategoryServiceProvider (for future use cases)
$this->app->bind(IndexCategoriesService::class, function ($app) {
    return new IndexCategoriesService(
        $app->make(ICategoryRepository::class)
    );
});
```

#### AppServiceProvider Registration

```php
// In app/Providers/AppServiceProvider.php
use App\Domains\Categories\Providers\CategoryServiceProvider;

public function register(): void
{
    // Register domain service providers
    $this->app->register(CategoryServiceProvider::class);
}
```
