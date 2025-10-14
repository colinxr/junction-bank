# TICKET-001: Database Schema & Migration

**Estimate:** 2-3 hours  
**Priority:** Critical  
**Dependencies:** None  
**PRD Reference:** Lines 356-402

## Overview

Create the foundational database schema for the Categories domain. This migration establishes the `categories` table with all required columns, constraints, and indexes as specified in the PRD.

## Technical Specifications

### Table Schema

```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    notes TEXT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_name (name),
    INDEX idx_type (type),
    INDEX idx_is_recurring (is_recurring)
);
```

### Column Specifications

| Column       | Type                      | Null | Default           | Purpose                    |
| ------------ | ------------------------- | ---- | ----------------- | -------------------------- |
| id           | BIGINT                    | NO   | AUTO_INCREMENT    | Primary key                |
| name         | VARCHAR(255)              | NO   | -                 | Category name (unique)     |
| type         | ENUM('income', 'expense') | NO   | -                 | Category type              |
| notes        | TEXT                      | YES  | NULL              | Optional description       |
| is_recurring | BOOLEAN                   | NO   | FALSE             | Recurring transaction flag |
| created_at   | TIMESTAMP                 | NO   | CURRENT_TIMESTAMP | Creation timestamp         |
| updated_at   | TIMESTAMP                 | NO   | CURRENT_TIMESTAMP | Update timestamp           |

### Indexes Required

1. **PRIMARY KEY** on `id` - Fast lookups by ID
2. **UNIQUE KEY** on `name` - Enforce uniqueness constraint
3. **INDEX** on `type` - Optimize filtering by income/expense
4. **INDEX** on `is_recurring` - Optimize recurring transaction queries

## Implementation Tasks

1. Create migration file: `php artisan make:migration create_categories_table`
2. Define `up()` method with table schema
3. Define `down()` method for rollback
4. Test migration execution
5. Test migration rollback

## Acceptance Criteria

-   [ ] Migration file created using artisan command
-   [ ] All 7 columns present with correct types
-   [ ] Unique constraint on `name` enforced
-   [ ] Indexes on `type` and `is_recurring` created
-   [ ] Primary key auto-increments
-   [ ] `up()` and `down()` methods implemented
-   [ ] Migration runs successfully: `php artisan migrate`
-   [ ] Migration rollback works: `php artisan migrate:rollback`
-   [ ] Schema matches PRD specification exactly
-   [ ] All test cases pass

## Validation Checklist

-   [ ] Run: `php artisan migrate` (no errors)
-   [ ] Verify table exists in database
-   [ ] Verify unique constraint: attempt duplicate insert (should fail)
-   [ ] Verify enum constraint: attempt invalid type (should fail)
-   [ ] Run: `php artisan migrate:rollback` (table removed)
-   [ ] Run: `php artisan migrate` again (idempotent)

## Related PRD Sections

-   **Data Model:** Lines 356-402
-   **Business Rules:** Lines 528-547
-   **Validation Rules:** Lines 550-590
