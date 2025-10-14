# TICKET-017: API Routes Configuration

**Estimate:** 1 hour  
**Priority:** High  
**Dependencies:** TICKET-014, TICKET-015, TICKET-016  
**PRD Reference:** Lines 182-353, 670-676

## Overview

Register all category API routes in Laravel's routes/api.php file. Configure authentication middleware using Laravel Sanctum, apply proper route grouping, and ensure all five RESTful endpoints are accessible with correct HTTP methods per PRD specifications.

## Technical Specifications

### Routes Configuration

Add to `routes/api.php`

```php
use App\Http\Controllers\CategoryController;

Route::middleware('auth:sanctum')->group(function () {
    // Category routes
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::get('/{id}', [CategoryController::class, 'show'])->name('show');
        Route::put('/{id}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('destroy');
    });
});
```

### Alternative Resource Route Format

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('categories', CategoryController::class);
});
```

### Route Specifications (PRD Lines 182-353)

| Method | URI                  | Action  | Description                     |
| ------ | -------------------- | ------- | ------------------------------- |
| GET    | /api/categories      | index   | List categories with pagination |
| POST   | /api/categories      | store   | Create new category             |
| GET    | /api/categories/{id} | show    | Get single category             |
| PUT    | /api/categories/{id} | update  | Update category                 |
| DELETE | /api/categories/{id} | destroy | Delete category                 |

### Middleware Configuration (PRD Lines 670-673)

**Authentication:**

-   Laravel Sanctum for API authentication
-   Required for all category operations
-   User-scoped operations only

## Implementation Tasks

1. Open `routes/api.php` file
2. Add CategoryController use statement
3. Create auth:sanctum middleware group
4. Create categories prefix group
5. Register GET /categories (index)
6. Register POST /categories (store)
7. Register GET /categories/{id} (show)
8. Register PUT /categories/{id} (update)
9. Register DELETE /categories/{id} (destroy)
10. Add route names for testing
11. Verify routes via artisan route:list
12. Write route tests

## Test Cases

### Route Registration Tests

```php
describe('Category Routes Registration', function () {
    it('registers GET /api/categories route');
    it('registers POST /api/categories route');
    it('registers GET /api/categories/{id} route');
    it('registers PUT /api/categories/{id} route');
    it('registers DELETE /api/categories/{id} route');
    it('all routes prefixed with /api/categories');
    it('all routes have named routes');
});
```

### Route Method Tests

```php
describe('Category Routes HTTP Methods', function () {
    it('index route accepts GET method only');
    it('store route accepts POST method only');
    it('show route accepts GET method only');
    it('update route accepts PUT method only');
    it('destroy route accepts DELETE method only');
    it('rejects incorrect HTTP methods');
});
```

### Authentication Middleware Tests

```php
describe('Category Routes Authentication', function () {
    it('applies auth:sanctum middleware to all routes');
    it('returns 401 when not authenticated on index');
    it('returns 401 when not authenticated on store');
    it('returns 401 when not authenticated on show');
    it('returns 401 when not authenticated on update');
    it('returns 401 when not authenticated on destroy');
    it('allows access when authenticated');
});
```

### Route Controller Binding Tests

```php
describe('Category Routes Controller Binding', function () {
    it('binds index to CategoryController@index');
    it('binds store to CategoryController@store');
    it('binds show to CategoryController@show');
    it('binds update to CategoryController@update');
    it('binds destroy to CategoryController@destroy');
});
```

### Route Parameter Tests

```php
describe('Category Routes Parameters', function () {
    it('accepts id parameter in show route');
    it('accepts id parameter in update route');
    it('accepts id parameter in delete route');
    it('accepts query parameters in index route');
    it('passes parameters to controller correctly');
});
```

### Route Naming Tests

```php
describe('Category Routes Naming', function () {
    it('names index route as categories.index');
    it('names store route as categories.store');
    it('names show route as categories.show');
    it('names update route as categories.update');
    it('names destroy route as categories.destroy');
    it('allows route generation via route() helper');
});
```

### Integration Tests

```php
describe('Category Routes Integration', function () {
    it('routes accessible via HTTP requests');
    it('routes return proper responses');
    it('routes integrate with controllers correctly');
    it('middleware chain executes properly');
    it('routes visible in route:list command');
});
```

### Edge Case Tests

```php
describe('Category Routes Edge Cases', function () {
    it('handles missing route parameters');
    it('handles non-numeric id parameters');
    it('handles very large id values');
    it('handles trailing slashes');
    it('rejects unsupported HTTP methods');
});
```

### CORS Tests

```php
describe('Category Routes CORS', function () {
    it('allows OPTIONS requests');
    it('returns proper CORS headers');
    it('handles preflight requests');
});
```

## Acceptance Criteria

-   [ ] All 5 routes registered in routes/api.php
-   [ ] Routes prefixed with /api/categories
-   [ ] auth:sanctum middleware applied to all routes
-   [ ] Routes grouped properly
-   [ ] Named routes configured
-   [ ] Controller methods bound correctly
-   [ ] ID parameter configured for show, update, destroy
-   [ ] Routes visible in `php artisan route:list`
-   [ ] Authentication required for all routes
-   [ ] Routes accessible via HTTP
-   [ ] 100% route test coverage
-   [ ] All 35+ test cases pass

## Validation Checklist

-   [ ] Run `php artisan route:list`
-   [ ] Verify 5 category routes present
-   [ ] Verify all routes show auth:sanctum middleware
-   [ ] Verify correct HTTP methods
-   [ ] Verify correct controller actions
-   [ ] GET /api/categories without auth
-   [ ] Verify 401 unauthorized response
-   [ ] GET /api/categories with auth token
-   [ ] Verify 200 success response
-   [ ] POST /api/categories without auth
-   [ ] Verify 401 unauthorized response
-   [ ] GET /api/categories/1 with auth
-   [ ] Verify 200 or 404 response
-   [ ] PUT /api/categories/1 with auth
-   [ ] Verify appropriate response
-   [ ] DELETE /api/categories/1 with auth
-   [ ] Verify appropriate response
-   [ ] Run tests: `php artisan test --filter=CategoryRoutesTest`

## Notes

-   Routes defined in routes/api.php automatically get /api prefix
-   auth:sanctum middleware validates Bearer tokens
-   Route names useful for generating URLs in tests
-   apiResource() provides cleaner syntax but less control
-   Manual route definition provides explicit configuration
-   Route model binding can be added later for automatic injection
-   Middleware runs before controller methods
-   CORS middleware should be configured in config/cors.php
-   Rate limiting can be added via throttle middleware
-   Route caching improves performance in production

## Related PRD Sections

-   **Endpoint 1: List Categories:** Lines 182-228
-   **Endpoint 2: Create Category:** Lines 231-275
-   **Endpoint 3: Get Category:** Lines 277-299
-   **Endpoint 4: Update Category:** Lines 301-333
-   **Endpoint 5: Delete Category:** Lines 335-353
-   **Authentication:** Lines 670-673
-   **Authorization:** Lines 674-676
