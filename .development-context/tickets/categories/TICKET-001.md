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
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_name (name)
);
```

### Column Specifications

| Column     | Type         | Null | Default           | Purpose                |
| ---------- | ------------ | ---- | ----------------- | ---------------------- |
| id         | BIGINT       | NO   | AUTO_INCREMENT    | Primary key            |
| name       | VARCHAR(255) | NO   | -                 | Category name (unique) |
| notes      | TEXT         | YES  | NULL              | Optional description   |
| created_at | TIMESTAMP    | NO   | CURRENT_TIMESTAMP | Creation timestamp     |
| updated_at | TIMESTAMP    | NO   | CURRENT_TIMESTAMP | Update timestamp       |

### Indexes Required

1. **PRIMARY KEY** on `id` - Fast lookups by ID
2. **UNIQUE KEY** on `name` - Enforce uniqueness constraint

## Implementation Tasks

1. Create migration file: `php artisan make:migration create_categories_table`
2. Define `up()` method with table schema
3. Define `down()` method for rollback
4. Test migration execution
5. Test migration rollback

## Acceptance Criteria

-   [ ] Migration file created using artisan command
-   [ ] All 5 columns present with correct types
-   [ ] Unique constraint on `name` enforced
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
-   [ ] Run: `php artisan migrate:rollback` (table removed)
-   [ ] Run: `php artisan migrate` again (idempotent)

## Changelog

| Version | Date       | Author   | Changes                                                                                                                              |
| ------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1     | 2024-12-19 | Dev Team | Removed `type` and `is_recurring` columns per PRD simplification - categories now focus on core properties (name, notes, timestamps) |
| 1.0     | 2024-12-19 | Dev Team | Initial schema with type and recurring fields                                                                                        |

## Related PRD Sections

-   **Data Model:** Lines 356-402
-   **Business Rules:** Lines 528-547
-   **Validation Rules:** Lines 550-590
