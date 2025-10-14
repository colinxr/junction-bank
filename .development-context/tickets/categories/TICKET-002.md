# TICKET-002: Category Eloquent Model

**Estimate:** 2-3 hours  
**Priority:** Critical  
**Dependencies:** TICKET-001  
**PRD Reference:** Lines 356-402, 394-397

## Overview

Create the Eloquent ORM model that maps to the `categories` database table. This model serves as the infrastructure layer's data access object and will be used by the repository implementation.

## Technical Specifications

### Model Location

`app/Models/Category.php`

### Model Configuration

```php
class Category extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'name',
        'type',
        'notes',
        'is_recurring'
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships (stubs for future implementation)
    public function transactions() {
        // Will be implemented in Transactions domain
    }

    public function recurringTransactions() {
        // Will be implemented in RecurringTransactions domain
    }
}
```

### Fillable Attributes

-   `name` - Category name (string)
-   `type` - Category type (string enum: 'income', 'expense')
-   `notes` - Optional description (string|null)
-   `is_recurring` - Recurring flag (boolean)

### Type Casting

-   `is_recurring` → boolean (stored as tinyint in DB)
-   `created_at` → datetime object
-   `updated_at` → datetime object

### Relationships (Future)

-   **hasMany** `transactions` - Categories can have many transactions
-   **hasMany** `recurringTransactions` - Categories can have many recurring transactions

## Implementation Tasks

1. Create model: `php artisan make:model Category`
2. Configure table name (if needed)
3. Set fillable attributes
4. Add type casts
5. Define relationship method stubs
6. Add PHPDoc annotations
7. Write model tests

## Acceptance Criteria

-   [ ] Model file created at `app/Models/Category.php`
-   [ ] All fillable attributes defined
-   [ ] Type casting configured for boolean and dates
-   [ ] Relationship method stubs present
-   [ ] PHPDoc blocks on all methods
-   [ ] Model can be instantiated successfully
-   [ ] Mass assignment works for fillable fields
-   [ ] Type casting works correctly
-   [ ] All test cases pass

## Validation Checklist

-   [ ] Create test category in tinker
-   [ ] Verify boolean casting: `$category->is_recurring === true`
-   [ ] Verify datetime casting: `$category->created_at instanceof Carbon`
-   [ ] Verify mass assignment: `Category::create([...])`
-   [ ] Run model tests: `php artisan test --filter=CategoryModelTest`

## Notes

-   Do NOT implement actual relationship logic yet (transactions table doesn't exist)
-   Keep relationship methods as empty stubs with TODO comments
-   Focus on basic model configuration and attributes
-   Ensure model aligns with migration from TICKET-001

## Related PRD Sections

-   **Data Model:** Lines 356-402
-   **Relationships:** Lines 394-397
-   **Layer Architecture - Infrastructure:** Lines 430-439
