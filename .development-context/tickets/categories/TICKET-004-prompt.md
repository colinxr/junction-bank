# TICKET-004: Category Repository Interface Implementation

**Context:** Laravel banking application using Domain-Driven Design. Repository interface must be framework-agnostic, defining only the contract for data persistence without implementation details.

**Your Role:** Senior PHP/DDD architect implementing pure domain repository interfaces with zero infrastructure dependencies.

---

## OBJECTIVE

Implement a repository interface at `app/Domains/Categories/Repositories/ICategoryRepository.php` that defines the contract for all category data persistence operations. This interface will be implemented by an Eloquent-based repository with Redis caching in a future ticket.

---

## CONSTRAINTS

### Technical

-   **NO Laravel dependencies** (no Eloquent, no facades, no helpers)
-   **NO infrastructure concerns** (no database, HTTP, or external services)
-   **Pure PHP 8.2+** interface definition only
-   Interface only - no implementation
-   Type hints on all parameters and return types
-   Comprehensive PHPDoc blocks on all methods
-   Document all exceptions that implementations should throw

### Domain Boundaries

-   Interface lives in domain layer
-   Works with Category entities (not Eloquent models)
-   Framework-agnostic design
-   Can be implemented by any persistence technology

---

## REQUIRED DELIVERABLES

### 1. Repository Interface

**File:** `app/Domains/Categories/Repositories/ICategoryRepository.php`

**Required Methods:**

1. `findAll(int $page = 1, int $limit = 20, ?string $type = null): array`
2. `findById(int $id): Category`
3. `create(Category $category): Category`
4. `update(Category $category): Category`
5. `delete(int $id): void`
6. `existsByName(string $name, ?int $excludeId = null): bool`
7. `hasTransactions(int $id): bool`
8. `hasRecurringTransactions(int $id): bool`

### 2. Interface Skeleton

```php
<?php

declare(strict_types=1);

namespace App\Domains\Categories\Repositories;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\CategoryNotFoundException;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;
use App\Domains\Categories\Exceptions\CategoryHasTransactionsException;

/**
 * Category Repository Interface
 *
 * Defines the contract for category data persistence operations.
 * Implementations should handle database operations, caching, and
 * transaction management.
 *
 * @package App\Domains\Categories\Repositories
 */
interface ICategoryRepository
{
    // Method signatures required here
}
```

---

## METHOD SPECIFICATIONS

### Method 1: findAll()

**Signature:**

```php
public function findAll(int $page = 1, int $limit = 20, ?string $type = null): array;
```

**Purpose:** Retrieve paginated list of categories with optional type filtering

**Parameters:**

-   `$page`: Page number (1-indexed), default 1
-   `$limit`: Items per page, default 20, max 100
-   `$type`: Optional filter by 'income' or 'expense'

**Returns:**

```php
[
    'data' => Category[],  // Array of Category entities
    'pagination' => [
        'currentPage' => int,
        'totalPages' => int,
        'totalItems' => int,
        'itemsPerPage' => int
    ]
]
```

**PHPDoc Requirements:**

-   Document all parameters with types and descriptions
-   Document return array structure
-   Use `@return array{data: Category[], pagination: array}` syntax
-   Note caching strategy: "Cache by page/limit/type combination"

---

### Method 2: findById()

**Signature:**

```php
public function findById(int $id): Category;
```

**Purpose:** Retrieve single category by ID

**Parameters:**

-   `$id`: Category ID

**Returns:** Category entity

**Throws:**

-   `CategoryNotFoundException` if not found

**PHPDoc Requirements:**

-   `@param int $id Category ID`
-   `@return Category`
-   `@throws CategoryNotFoundException`
-   Note: "Cache by ID"

---

### Method 3: create()

**Signature:**

```php
public function create(Category $category): Category;
```

**Purpose:** Persist new category to database

**Parameters:**

-   `$category`: Category entity (ID should be null)

**Returns:** Category entity with assigned ID

**Throws:**

-   `CategoryAlreadyExistsException` if name already exists

**PHPDoc Requirements:**

-   `@param Category $category Category entity to persist`
-   `@return Category Persisted category with ID assigned`
-   `@throws CategoryAlreadyExistsException If name already exists`
-   Note: "Invalidates list caches"

**Business Logic:**

1. Check name uniqueness using `existsByName()`
2. Persist to database
3. Return new entity with ID
4. Invalidate cache keys: `categories:list:*`

---

### Method 4: update()

**Signature:**

```php
public function update(Category $category): Category;
```

**Purpose:** Update existing category

**Parameters:**

-   `$category`: Category entity with changes (ID must be set)

**Returns:** Updated Category entity

**Throws:**

-   `CategoryNotFoundException` if category doesn't exist
-   `CategoryAlreadyExistsException` if new name conflicts

**PHPDoc Requirements:**

-   `@param Category $category Category entity with changes`
-   `@return Category Updated category`
-   `@throws CategoryNotFoundException`
-   `@throws CategoryAlreadyExistsException If new name conflicts`
-   Note: "Invalidates specific category and list caches"

**Business Logic:**

1. Verify category exists
2. Check name uniqueness (excluding self)
3. Persist changes
4. Invalidate cache keys: `categories:{id}`, `categories:list:*`

---

### Method 5: delete()

**Signature:**

```php
public function delete(int $id): void;
```

**Purpose:** Remove category from database

**Parameters:**

-   `$id`: Category ID

**Returns:** void

**Throws:**

-   `CategoryNotFoundException` if category doesn't exist
-   `CategoryHasTransactionsException` if has dependencies

**PHPDoc Requirements:**

-   `@param int $id Category ID`
-   `@return void`
-   `@throws CategoryNotFoundException`
-   `@throws CategoryHasTransactionsException If has associated transactions`
-   Note: "Checks both transactions and recurring_transactions before deletion"

**Business Logic:**

1. Verify category exists
2. Check `hasTransactions()`
3. Check `hasRecurringTransactions()`
4. Delete if no dependencies
5. Invalidate cache keys: `categories:{id}`, `categories:list:*`

---

### Method 6: existsByName()

**Signature:**

```php
public function existsByName(string $name, ?int $excludeId = null): bool;
```

**Purpose:** Check if category name already exists (for uniqueness validation)

**Parameters:**

-   `$name`: Category name to check
-   `$excludeId`: Optional category ID to exclude (for updates)

**Returns:** `true` if name exists, `false` otherwise

**PHPDoc Requirements:**

-   `@param string $name Category name to check`
-   `@param int|null $excludeId ID to exclude from check (for updates)`
-   `@return bool`
-   Note: "Used by create and update operations to enforce unique names"

**Business Logic:**

-   Check case-sensitive name match
-   Exclude `$excludeId` if provided (for self-update)
-   Return boolean result

---

### Method 7: hasTransactions()

**Signature:**

```php
public function hasTransactions(int $id): bool;
```

**Purpose:** Check if category has associated transactions

**Parameters:**

-   `$id`: Category ID

**Returns:** `true` if has transactions, `false` otherwise

**PHPDoc Requirements:**

-   `@param int $id Category ID`
-   `@return bool`
-   Note: "Used before deletion to prevent orphaned transactions"

**Business Logic:**

-   Query transactions table for category_id
-   Return true if any exist

---

### Method 8: hasRecurringTransactions()

**Signature:**

```php
public function hasRecurringTransactions(int $id): bool;
```

**Purpose:** Check if category has associated recurring transactions

**Parameters:**

-   `$id`: Category ID

**Returns:** `true` if has recurring transactions, `false` otherwise

**PHPDoc Requirements:**

-   `@param int $id Category ID`
-   `@return bool`
-   Note: "Used before deletion to prevent orphaned recurring transactions"

**Business Logic:**

-   Query recurring_transactions table for category_id
-   Return true if any exist

---

## VALIDATION CHECKLIST

Before marking complete, verify:

-   [ ] Interface file exists at `app/Domains/Categories/Repositories/ICategoryRepository.php`
-   [ ] Interface has NO `use Illuminate\*` imports
-   [ ] Interface has NO implementation code (methods have no bodies)
-   [ ] All 8 methods defined with complete signatures
-   [ ] Type hints on all parameters
-   [ ] Return type declarations on all methods
-   [ ] PHPDoc block on interface class
-   [ ] PHPDoc blocks on all methods
-   [ ] `@throws` annotations on methods that throw exceptions
-   [ ] Proper namespace: `App\Domains\Categories\Repositories`
-   [ ] Imports for Category entity and all exceptions
-   [ ] `declare(strict_types=1);` at top of file
-   [ ] No static analysis errors: `vendor/bin/phpstan analyse app/Domains/Categories/Repositories`

---

## BUSINESS RULES ENFORCED BY IMPLEMENTATIONS

### Rule 1: Unique Category Names (Lines 528-534)

**Description:** Each category name must be unique within the system  
**Enforced By:** `create()` and `update()` methods  
**Validation:** Use `existsByName()` before persisting  
**Exception:** `CategoryAlreadyExistsException`

### Rule 2: Category Deletion Protection (Lines 536-541)

**Description:** Cannot delete categories with associated transactions or recurring transactions  
**Enforced By:** `delete()` method  
**Validation:** Use `hasTransactions()` and `hasRecurringTransactions()` before deletion  
**Exception:** `CategoryHasTransactionsException`

---

## CACHING STRATEGY REFERENCE (Lines 505-525)

Implementations should use these cache keys:

```
categories:list:{user_id}:{page}:{limit}:{type}    # Paginated lists (1 hour TTL)
categories:{id}                                     # Single category (24 hour TTL)
categories:user:{user_id}                          # All user categories (1 hour TTL)
```

**Invalidation Rules:**

-   **Create:** Invalidate `categories:list:*`
-   **Update:** Invalidate `categories:{id}` and `categories:list:*`
-   **Delete:** Invalidate `categories:{id}` and `categories:list:*`

---

## EXCEPTION HANDLING

### Required Exception Imports

```php
use App\Domains\Categories\Exceptions\CategoryNotFoundException;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;
use App\Domains\Categories\Exceptions\CategoryHasTransactionsException;
```

### Exception Usage Map

| Method                       | Throws                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `findById()`                 | `CategoryNotFoundException`                                     |
| `create()`                   | `CategoryAlreadyExistsException`                                |
| `update()`                   | `CategoryNotFoundException`, `CategoryAlreadyExistsException`   |
| `delete()`                   | `CategoryNotFoundException`, `CategoryHasTransactionsException` |
| `existsByName()`             | None                                                            |
| `hasTransactions()`          | None                                                            |
| `hasRecurringTransactions()` | None                                                            |

---

## IMPLEMENTATION SEQUENCE

1. Create interface file with namespace and strict types
2. Add class-level PHPDoc block
3. Add all required imports (Category entity + exceptions)
4. Define `findAll()` method signature with PHPDoc
5. Define `findById()` method signature with PHPDoc
6. Define `create()` method signature with PHPDoc
7. Define `update()` method signature with PHPDoc
8. Define `delete()` method signature with PHPDoc
9. Define `existsByName()` method signature with PHPDoc
10. Define `hasTransactions()` method signature with PHPDoc
11. Define `hasRecurringTransactions()` method signature with PHPDoc
12. Verify PHPStan passes: `vendor/bin/phpstan analyse app/Domains/Categories/Repositories`
13. Verify IDE autocomplete works when type-hinting the interface

---

## ANTI-PATTERNS TO AVOID

❌ Adding implementation code to interface methods  
❌ Using Laravel helpers or facades  
❌ Type-hinting Eloquent models instead of Category entity  
❌ Using `mixed` return types (be specific)  
❌ Missing `@throws` annotations  
❌ Vague parameter names like `$data` or `$params`  
❌ Missing PHPDoc blocks

✅ Interface only (no implementation)  
✅ Pure PHP type hints  
✅ Domain entity type hints (Category)  
✅ Comprehensive PHPDoc  
✅ Clear exception documentation  
✅ Specific return types  
✅ Framework-agnostic design

---

## SUCCESS CRITERIA

**Must achieve ALL:**

-   Interface can be type-hinted in constructor: `public function __construct(ICategoryRepository $repo)`
-   Interface can be imported: `use App\Domains\Categories\Repositories\ICategoryRepository;`
-   PHPStan level 9 passes with no errors
-   IDE provides autocomplete for all 8 methods
-   All method signatures match specifications exactly
-   All PHPDoc blocks present and complete
-   No Laravel/framework dependencies
-   Interface can be implemented by any PHP class

---

## DEPENDENCY INJECTION REFERENCE (Lines 465-484)

This interface will be bound in `AppServiceProvider`:

```php
$this->app->singleton(ICategoryRepository::class, function ($app) {
    return new CategoryRepository(
        $app->make('db'),
        $app->make('redis')
    );
});
```

The concrete implementation will be created in TICKET-006.

---

## OUTPUT FORMAT

Provide implementation in this order:

1. Interface file with complete implementation
2. Confirmation of PHPStan validation
3. Confirmation of IDE autocomplete test

The file must include:

-   Proper namespace
-   PHPDoc file header
-   Strict types declaration
-   Complete interface definition with all 8 methods
-   All imports at top of file

---

## REFERENCE: PRD SECTIONS

**Repository Pattern:** Lines 412-416  
**Repository Implementation:** Lines 431-435  
**Dependency Injection:** Lines 465-484  
**Business Rules:** Lines 528-547  
**Caching Strategy:** Lines 505-525  
**Error Handling:** Lines 593-623

---

## VERIFICATION COMMANDS

After implementation, run these commands to verify:

```bash
# Static analysis
vendor/bin/phpstan analyse app/Domains/Categories/Repositories

# Check namespace and imports work
php artisan tinker
> $reflection = new ReflectionClass(App\Domains\Categories\Repositories\ICategoryRepository::class);
> $reflection->getMethods();
```

Expected output: 8 methods with correct signatures.

---

**CRITICAL:** This is an interface definition only. Do not implement any method bodies. The interface defines the contract that will be implemented by `CategoryRepository` in a future ticket.
