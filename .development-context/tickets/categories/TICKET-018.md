# TICKET-018: Service Provider Bindings

**Estimate:** 2 hours  
**Priority:** Critical  
**Dependencies:** TICKET-006, TICKET-008 through TICKET-012  
**PRD Reference:** Lines 404-485

## Overview

Configure Laravel's service container bindings in AppServiceProvider to wire up the dependency injection for the Categories domain. Register repository interface implementation and all use case service bindings to enable constructor injection throughout the application per PRD specifications.

## Technical Specifications

### Service Provider Location

`app/Providers/AppServiceProvider.php`

### Service Provider Structure

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Infrastructure\Repositories\CategoryRepository;
use App\Domains\Categories\Actions\{
    IndexCategoriesService,
    ShowCategoryAction,
    StoreCategoryAction,
    UpdateCategoryAction,
    DeleteCategoryAction
};
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository binding (Singleton)
        $this->app->singleton(ICategoryRepository::class, function ($app) {
            return new CategoryRepository(
                $app->make('db'),
                $app->make('redis')
            );
        });

        // Mapper binding (Singleton)
        $this->app->singleton(CategoryMapper::class, function ($app) {
            return new CategoryMapper();
        });

        // Use Case Service bindings (Transient)
        $this->app->bind(IndexCategoriesService::class, function ($app) {
            return new IndexCategoriesService(
                $app->make(ICategoryRepository::class),
                $app->make(CategoryMapper::class)
            );
        });

        $this->app->bind(ShowCategoryAction::class, function ($app) {
            return new ShowCategoryAction(
                $app->make(ICategoryRepository::class),
                $app->make(CategoryMapper::class)
            );
        });

        $this->app->bind(StoreCategoryAction::class, function ($app) {
            return new StoreCategoryAction(
                $app->make(ICategoryRepository::class),
                $app->make(CategoryMapper::class)
            );
        });

        $this->app->bind(UpdateCategoryAction::class, function ($app) {
            return new UpdateCategoryAction(
                $app->make(ICategoryRepository::class),
                $app->make(CategoryMapper::class)
            );
        });

        $this->app->bind(DeleteCategoryAction::class, function ($app) {
            return new DeleteCategoryAction(
                $app->make(ICategoryRepository::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
```

### Binding Specifications (PRD Lines 467-484)

**Singleton Bindings:**

-   ICategoryRepository → CategoryRepository (shared instance)
-   CategoryMapper → CategoryMapper (shared instance)

**Transient Bindings:**

-   IndexCategoriesService (new instance per resolution)
-   ShowCategoryAction (new instance per resolution)
-   StoreCategoryAction (new instance per resolution)
-   UpdateCategoryAction (new instance per resolution)
-   DeleteCategoryAction (new instance per resolution)

### Dependency Graph

```
CategoryController
├── IndexCategoriesService
│   ├── ICategoryRepository (singleton)
│   └── CategoryMapper (singleton)
├── ShowCategoryAction
│   ├── ICategoryRepository (singleton)
│   └── CategoryMapper (singleton)
├── StoreCategoryAction
│   ├── ICategoryRepository (singleton)
│   └── CategoryMapper (singleton)
├── UpdateCategoryAction
│   ├── ICategoryRepository (singleton)
│   └── CategoryMapper (singleton)
└── DeleteCategoryAction
    └── ICategoryRepository (singleton)
```

## Implementation Tasks

1. Open `app/Providers/AppServiceProvider.php`
2. Add use statements for all classes
3. Register ICategoryRepository → CategoryRepository singleton
4. Configure repository with DB and Redis dependencies
5. Register CategoryMapper singleton
6. Register IndexCategoriesService transient binding
7. Register ShowCategoryAction transient binding
8. Register StoreCategoryAction transient binding
9. Register UpdateCategoryAction transient binding
10. Register DeleteCategoryAction transient binding
11. Verify dependency resolution
12. Write binding tests

## Test Cases

### Repository Binding Tests

```php
describe('Service Provider Repository Bindings', function () {
    it('binds ICategoryRepository to CategoryRepository');
    it('resolves ICategoryRepository as singleton');
    it('returns same instance on multiple resolutions');
    it('injects DB connection into repository');
    it('injects Redis connection into repository');
    it('repository is instance of ICategoryRepository');
    it('repository is instance of CategoryRepository');
});
```

### Mapper Binding Tests

```php
describe('Service Provider Mapper Bindings', function () {
    it('binds CategoryMapper as singleton');
    it('resolves CategoryMapper correctly');
    it('returns same instance on multiple resolutions');
});
```

### Use Case Service Binding Tests

```php
describe('Service Provider Use Case Bindings', function () {
    it('resolves IndexCategoriesService');
    it('resolves ShowCategoryAction');
    it('resolves StoreCategoryAction');
    it('resolves UpdateCategoryAction');
    it('resolves DeleteCategoryAction');
    it('creates new instance each time for services');
    it('injects repository into all services');
    it('injects mapper into services that need it');
});
```

### Dependency Injection Tests

```php
describe('Service Provider Dependency Injection', function () {
    it('resolves repository dependency in IndexCategoriesService');
    it('resolves repository dependency in ShowCategoryAction');
    it('resolves repository dependency in StoreCategoryAction');
    it('resolves repository dependency in UpdateCategoryAction');
    it('resolves repository dependency in DeleteCategoryAction');
    it('resolves mapper dependency in services');
    it('all dependencies auto-resolve');
});
```

### Controller Injection Tests

```php
describe('Service Provider Controller Injection', function () {
    it('resolves CategoryController');
    it('injects IndexCategoriesService into controller');
    it('injects ShowCategoryAction into controller');
    it('injects StoreCategoryAction into controller');
    it('injects UpdateCategoryAction into controller');
    it('injects DeleteCategoryAction into controller');
    it('controller receives all dependencies');
});
```

### Singleton Behavior Tests

```php
describe('Service Provider Singleton Behavior', function () {
    it('repository instance is shared across services');
    it('mapper instance is shared across services');
    it('repository maintains state between resolutions');
    it('same repository instance in all services');
});
```

### Circular Dependency Tests

```php
describe('Service Provider Circular Dependencies', function () {
    it('has no circular dependencies');
    it('dependency graph is acyclic');
    it('all dependencies can resolve');
});
```

### Binding Scope Tests

```php
describe('Service Provider Binding Scopes', function () {
    it('uses singleton for repository');
    it('uses singleton for mapper');
    it('uses transient for services');
    it('respects binding scopes correctly');
});
```

### Integration Tests

```php
describe('Service Provider Integration', function () {
    it('all bindings work together');
    it('enables full CRUD operations');
    it('resolves entire dependency tree');
    it('services can access repository methods');
    it('no runtime binding errors');
});
```

### Edge Case Tests

```php
describe('Service Provider Edge Cases', function () {
    it('handles binding before boot');
    it('handles multiple provider registrations');
    it('handles missing dependencies gracefully');
    it('bindings available in all contexts');
});
```

## Acceptance Criteria

-   [ ] AppServiceProvider updated with bindings
-   [ ] ICategoryRepository bound to CategoryRepository
-   [ ] Repository registered as singleton
-   [ ] CategoryMapper registered as singleton
-   [ ] All 5 use case services registered as transient
-   [ ] DB and Redis injected into repository
-   [ ] Repository and mapper injected into services
-   [ ] All dependencies resolve correctly
-   [ ] No circular dependencies
-   [ ] Singleton vs transient scopes correct
-   [ ] Controller can resolve with all services
-   [ ] 100% test coverage
-   [ ] All 40+ test cases pass

## Validation Checklist

-   [ ] Run `php artisan tinker`
-   [ ] Execute: `app(App\Domains\Categories\Repositories\ICategoryRepository::class)`
-   [ ] Verify CategoryRepository instance returned
-   [ ] Execute again and verify same instance (singleton)
-   [ ] Execute: `app(App\Domains\Categories\Actions\IndexCategoriesService::class)`
-   [ ] Verify service resolved with dependencies
-   [ ] Verify repository property is set
-   [ ] Verify mapper property is set
-   [ ] Execute: `app(App\Http\Controllers\CategoryController::class)`
-   [ ] Verify controller resolved with all 5 services
-   [ ] Create category via API
-   [ ] Verify dependency injection works end-to-end
-   [ ] Run tests: `php artisan test --filter=ServiceProviderBindingsTest`

## Notes

-   AppServiceProvider is loaded on every request
-   Singleton bindings create one instance per application lifecycle
-   Transient bindings create new instance per resolution
-   Repository should be singleton for cache sharing
-   Services should be transient to avoid state issues
-   Closure-based binding allows explicit dependency control
-   Automatic resolution works when type-hints match bindings
-   Container can auto-resolve concrete classes without bindings
-   Explicit bindings document dependencies clearly
-   Bindings enable easy testing via mocking
-   Use `app()->bind()` for transient, `app()->singleton()` for singletons
-   Verify no circular dependencies exist

## Related PRD Sections

-   **Dependency Injection:** Lines 464-485
-   **Service Bindings:** Lines 467-475 (repository)
-   **Action/Service Bindings:** Lines 478-484
-   **Layer Architecture:** Lines 404-450
-   **Repository Pattern:** Lines 412-414
-   **Use Cases (Actions):** Lines 418-425
