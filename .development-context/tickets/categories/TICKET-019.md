# TICKET-019: Integration Tests - CRUD Flow

**Estimate:** 4-5 hours  
**Priority:** High  
**Dependencies:** TICKET-014, TICKET-015, TICKET-016, TICKET-017  
**PRD Reference:** Lines 627-665, 34-57

## Overview

Create comprehensive integration test suite that validates the complete CRUD flow for categories through the API layer. Tests should cover happy paths, authentication requirements, validation errors, business rule violations, and end-to-end workflows per PRD specifications.

## Technical Specifications

### Test File Location

`tests/Feature/CategoryCRUDTest.php`

### Test Framework

-   PHPUnit with Pest syntax
-   Laravel testing utilities
-   Database transactions for isolation
-   Sanctum authentication

### Test Structure Template

```php
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Category CRUD Integration', function () {
    // Test cases here
});
```

## Implementation Tasks

1. Create Feature test file
2. Set up database transactions
3. Create user factory for authentication
4. Implement full CRUD flow test
5. Write authentication tests
6. Write validation error tests
7. Write business rule violation tests
8. Write user isolation tests
9. Set up test database seeding
10. Add cleanup and teardown

## Test Cases

### Complete CRUD Flow Tests

```php
describe('Category Complete CRUD Flow', function () {
    it('completes full CRUD lifecycle successfully', function () {
        // Arrange: Authenticate user
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Act & Assert: Create
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->postJson('/api/categories', [
            'name' => 'Groceries',
            'notes' => 'Food and household'
        ]);

        $response->assertStatus(201);
        $categoryId = $response->json('data.id');

        // Act & Assert: Read (Index)
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Groceries');

        // Act & Assert: Read (Show)
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->getJson("/api/categories/{$categoryId}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Groceries');

        // Act & Assert: Update
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->putJson("/api/categories/{$categoryId}", [
            'name' => 'Food'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Food');

        // Act & Assert: Delete
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->deleteJson("/api/categories/{$categoryId}");

        $response->assertStatus(204);

        // Verify deletion
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->getJson("/api/categories/{$categoryId}");

        $response->assertStatus(404);
    });

    it('maintains data consistency throughout CRUD operations');
    it('handles rapid successive CRUD operations');
    it('preserves unchanged fields during updates');
    it('enforces all business rules during flow');
});
```

### Authentication Requirement Tests

```php
describe('Category CRUD Authentication', function () {
    it('requires authentication for index', function () {
        $response = $this->getJson('/api/categories');
        $response->assertStatus(401);
    });

    it('requires authentication for store', function () {
        $response = $this->postJson('/api/categories', [
            'name' => 'Test'
        ]);
        $response->assertStatus(401);
    });

    it('requires authentication for show', function () {
        $response = $this->getJson('/api/categories/1');
        $response->assertStatus(401);
    });

    it('requires authentication for update', function () {
        $response = $this->putJson('/api/categories/1', [
            'name' => 'Updated'
        ]);
        $response->assertStatus(401);
    });

    it('requires authentication for destroy', function () {
        $response = $this->deleteJson('/api/categories/1');
        $response->assertStatus(401);
    });

    it('accepts valid Bearer token');
    it('rejects invalid Bearer token');
    it('rejects expired token');
    it('associates created categories with authenticated user');
});
```

### Validation Error Tests

```php
describe('Category CRUD Validation Errors', function () {
    it('returns 422 when creating without name', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->postJson('/api/categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('returns 422 when name exceeds 255 characters');
    it('returns 422 when notes exceed 1000 characters');
    it('returns 422 when updating with invalid data');
    it('returns 422 for invalid pagination parameters');
    it('returns validation errors with proper structure');
    it('returns multiple validation errors when multiple fields invalid');
    it('includes error messages in validation response');
});
```

### Business Rule Violation Tests

```php
describe('Category CRUD Business Rule Violations', function () {
    it('returns 409 when creating duplicate category name', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Create first category
        $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->postJson('/api/categories', [
            'name' => 'Groceries'
        ])->assertStatus(201);

        // Attempt duplicate
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->postJson('/api/categories', [
            'name' => 'Groceries'
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'CATEGORY_EXISTS');
    });

    it('returns 409 when updating to existing name');
    it('returns 409 when deleting category with transactions');
    it('allows same name for different users');
    it('enforces name uniqueness case-sensitively');
    it('prevents deletion of categories with recurring transactions');
});
```

### Pagination and Filtering Tests

```php
describe('Category CRUD Pagination and Filtering', function () {
    it('paginates categories correctly', function () {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // Create 25 categories
        for ($i = 1; $i <= 25; $i++) {
            $this->withHeaders([
                'Authorization' => "Bearer $token"
            ])->postJson('/api/categories', [
                'name' => "Category $i"
            ]);
        }

        // Test pagination
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token"
        ])->getJson('/api/categories?page=1&limit=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('pagination.currentPage', 1)
            ->assertJsonPath('pagination.itemsPerPage', 10)
            ->assertJsonPath('pagination.totalItems', 25);
    });

    it('returns correct page of results');
    it('handles page beyond available pages');
    it('respects limit parameter');
    it('defaults to page 1 and limit 20');
});
```

### User Isolation Tests

```php
describe('Category CRUD User Isolation', function () {
    it('only returns categories for authenticated user', function () {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $token1 = $user1->createToken('test')->plainTextToken;
        $token2 = $user2->createToken('test')->plainTextToken;

        // User 1 creates category
        $this->withHeaders([
            'Authorization' => "Bearer $token1"
        ])->postJson('/api/categories', [
            'name' => 'User1 Category'
        ]);

        // User 2 should not see User 1's category
        $response = $this->withHeaders([
            'Authorization' => "Bearer $token2"
        ])->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    });

    it('cannot access another users category by ID');
    it('cannot update another users category');
    it('cannot delete another users category');
    it('allows duplicate names across different users');
    it('isolates all operations by user');
});
```

### Response Format Tests

```php
describe('Category CRUD Response Formats', function () {
    it('returns correct format for index');
    it('returns correct format for store');
    it('returns correct format for show');
    it('returns correct format for update');
    it('returns empty content for destroy');
    it('includes all required fields in responses');
    it('formats dates as ISO 8601');
    it('uses camelCase for property names');
    it('includes pagination metadata in index');
    it('wraps single resources in data key');
    it('wraps collections in data key');
});
```

### Error Handling Tests

```php
describe('Category CRUD Error Handling', function () {
    it('returns 404 for non-existent category show');
    it('returns 404 for non-existent category update');
    it('returns 404 for non-existent category delete');
    it('returns proper error structure for all errors');
    it('includes error message and code');
    it('handles database connection errors gracefully');
    it('handles validation errors gracefully');
    it('maintains data integrity on errors');
});
```

### Edge Case Tests

```php
describe('Category CRUD Edge Cases', function () {
    it('handles creating category with minimal data');
    it('handles creating category with all fields');
    it('handles updating with no changes');
    it('handles empty query results');
    it('handles special characters in names');
    it('handles unicode characters in names');
    it('handles very long valid names');
    it('handles rapid successive operations');
    it('handles concurrent requests');
});
```

### Cache Behavior Tests

```php
describe('Category CRUD Cache Behavior', function () {
    it('invalidates cache after create');
    it('invalidates cache after update');
    it('invalidates cache after delete');
    it('serves cached data on subsequent reads');
    it('cache reflects latest data after mutations');
});
```

## Acceptance Criteria

-   [ ] Integration test suite created
-   [ ] Uses RefreshDatabase trait
-   [ ] Full CRUD flow test passes
-   [ ] All authentication tests pass
-   [ ] All validation error tests pass
-   [ ] All business rule tests pass
-   [ ] All user isolation tests pass
-   [ ] All pagination tests pass
-   [ ] All response format tests pass
-   [ ] All error handling tests pass
-   [ ] All edge case tests pass
-   [ ] Tests use test database
-   [ ] Tests clean up after themselves
-   [ ] 100% integration test coverage
-   [ ] All 70+ test cases pass

## Validation Checklist

-   [ ] Run `php artisan test --filter=CategoryCRUDTest`
-   [ ] Verify all tests pass
-   [ ] Verify database is refreshed between tests
-   [ ] Run with --coverage flag
-   [ ] Verify 100% code coverage for integration paths
-   [ ] Run tests multiple times for consistency
-   [ ] Verify no flaky tests
-   [ ] Check test execution time (should be < 10 seconds)

## Notes

-   Use RefreshDatabase trait for clean test state
-   Use factories for test data generation
-   Use Sanctum for test authentication
-   Each test should be isolated and independent
-   Use descriptive test names
-   Follow Arrange-Act-Assert pattern
-   Test both happy paths and error paths
-   Verify database state after operations
-   Use JSON assertions for API responses
-   Test user isolation thoroughly
-   Verify cache behavior
-   Keep tests fast and focused

## Related PRD Sections

-   **Testing Strategy:** Lines 627-665
-   **API Endpoint Tests:** Lines 649-655
-   **Database Tests:** Lines 656-660
-   **Cache Tests:** Lines 661-665
-   **Success Metrics:** Lines 42-48
-   **All API Endpoints:** Lines 182-353

## Changelog

| Version | Date       | Changes                                                                                                                                                                                                                        |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1     | 2024-12-19 | Removed `type` and `isRecurring` properties from integration tests. Categories now focus on core properties: name, notes, and timestamps. Updated test cases, request/response examples, and validation scenarios accordingly. |
