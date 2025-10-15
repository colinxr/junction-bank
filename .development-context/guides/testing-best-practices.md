# Testing Best Practices Guide

## Overview

This guide establishes comprehensive testing standards and best practices for the Junction Bank project, covering both PHP (Laravel) and TypeScript (Next.js) components.

## Table of Contents

1. [PHP Testing with PEST](#php-testing-with-pest)
2. [TypeScript Testing with Vitest](#typescript-testing-with-vitest)
3. [Test Organization](#test-organization)
4. [Writing Readable Tests](#writing-readable-tests)
5. [Coverage Standards](#coverage-standards)
6. [Testing Patterns](#testing-patterns)
7. [Common Pitfalls](#common-pitfalls)

## PHP Testing with PEST

### Framework and Setup

-   **Framework**: PEST (Laravel's modern testing framework)
-   **Syntax**: Use `describe()` and `it()` blocks for organization
-   **Assertions**: Use `expect()` syntax for readability
-   **Database**: Use `RefreshDatabase` trait for database tests

### Basic Structure

```php
<?php

declare(strict_types=1);

use App\Domains\Categories\Infrastructure\Repositories\CategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mapper = new CategoryMapper();
    $this->repository = new CategoryRepository($this->mapper);
});

describe('CategoryRepository', function () {
    describe('findById', function () {
        it('finds single category by id', function () {
            // Test implementation
        });
    });
});
```

### Model Creation Best Practices

**Always use factories instead of manual instantiation:**

```php
// ❌ Don't do this
$model = new CategoryModel();
$model->id = 1;
$model->name = 'Test Category';

// ✅ Do this instead
$model = CategoryModel::factory()->make([
    'name' => 'Test Category',
    'notes' => 'Test notes'
]);
$model->id = 1; // Only set ID when needed for testing

// ✅ Or use factory methods
$model = CategoryModel::factory()
    ->withoutNotes()
    ->withName('Test Category')
    ->make();
```

### Readable Assertions

**Use chained assertions with `and()`:**

```php
// ❌ Multiple separate expect calls
expect($entity)->toBeInstanceOf(Category::class);
expect($entity->getId())->toBe(1);
expect($entity->getName())->toBe('Test Category');

// ✅ Chained assertions
expect($entity)
    ->toBeInstanceOf(Category::class)
    ->and($entity->getId())->toBe(1)
    ->and($entity->getName())->toBe('Test Category');
```

**Use descriptive matchers:**

```php
// ✅ Use specific matchers
expect($result)->toBeTrue();
expect($result)->toBeFalse();
expect($result)->toBeNull();
expect($result)->toHaveCount(2);
expect($result)->toHaveKey('data');
expect($collection)->each->toBeInstanceOf(Category::class);
```

**Use `toEqual()` for object comparison:**

```php
// ✅ For Carbon objects and complex comparisons
expect($convertedEntity->getCreatedAt())->toEqual($originalEntity->getCreatedAt());
```

### Exception Testing

```php
// ✅ Clear exception testing
expect(fn() => $this->repository->findById(999))
    ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
```

## TypeScript Testing with Vitest

### Framework and Setup

-   **Framework**: Vitest
-   **Test placement**: Colocate `*.test.ts` next to implementation
-   **Assertions**: Use Vitest's expect API

### Basic Structure

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { CategoryService } from "./category-service";

describe("CategoryService", () => {
    beforeEach(() => {
        // Setup
    });

    describe("createCategory", () => {
        it("creates category with valid data", () => {
            // Test implementation
        });
    });
});
```

## Test Organization

### File Naming Conventions

-   **PHP**: `*Test.php` (e.g., `CategoryRepositoryTest.php`)
-   **TypeScript**: `*.test.ts` (e.g., `category-service.test.ts`)

### Test Structure Hierarchy

```
describe('ComponentName', function () {
    describe('methodName', function () {
        it('should do something specific', function () {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

### Test Categories

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test component interactions
3. **Feature Tests**: Test complete user workflows

## Writing Readable Tests

### The AAA Pattern

Always structure tests with Arrange, Act, Assert:

```php
it('creates new category', function () {
    // Arrange: Set up test data
    $category = new Category(
        name: 'New Category',
        notes: 'New notes'
    );

    // Act: Execute the method under test
    $created = $this->repository->create($category);

    // Assert: Verify the results
    expect($created)
        ->toBeInstanceOf(Category::class)
        ->and($created->getId())->not->toBeNull()
        ->and($created->getName())->toBe('New Category');
});
```

### Descriptive Test Names

```php
// ❌ Vague test names
it('works', function () {});
it('test create', function () {});

// ✅ Descriptive test names
it('creates new category with valid data', function () {});
it('throws exception when creating duplicate category name', function () {});
it('handles null timestamps in entity conversion', function () {});
```

### Group Related Assertions

```php
it('converts model to entity correctly', function () {
    // Arrange
    $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => 'Test notes',
        'created_at' => Carbon::now()
    ]);
    $model->id = 1;

    // Act
    $entity = $this->mapper->toEntity($model);

    // Assert - Group related checks
    expect($entity)
        ->toBeInstanceOf(Category::class)
        ->and($entity->getId())->toBe(1);

    expect($entity->getName())->toBe('Test Category')
        ->and($entity->getNotes())->toBe('Test notes');

    expect($entity->getCreatedAt())->toBeInstanceOf(Carbon::class);
});
```

## Coverage Standards

### PHP Coverage Targets

-   **Domains** (entities, actions, mappers): ≥ 85% lines
-   **Repositories and API routes**: ≥ 75% lines
-   **Controllers**: ≥ 70% lines

### TypeScript Coverage Targets

-   **Domain services**: ≥ 85% lines
-   **API routes**: ≥ 75% lines
-   **Components**: ≥ 70% lines

### Running Coverage

```bash
# PHP
php artisan test --coverage

# TypeScript
npm run test:coverage
```

## Testing Patterns

### Repository Testing

```php
describe('CategoryRepository', function () {
    describe('create', function () {
        it('creates new category', function () {
            $category = new Category(
                name: 'New Category',
                notes: 'New notes'
            );

            $created = $this->repository->create($category);

            expect($created)
                ->toBeInstanceOf(Category::class)
                ->and($created->getId())->not->toBeNull();

            // Verify database state
            $this->assertDatabaseHas('categories', [
                'name' => 'New Category',
                'notes' => 'New notes'
            ]);
        });

        it('throws exception when creating duplicate name', function () {
            CategoryModel::factory()->create(['name' => 'Existing Category']);

            $category = new Category(
                name: 'Existing Category',
                notes: 'Some notes'
            );

            expect(fn() => $this->repository->create($category))
                ->toThrow(CategoryAlreadyExistsException::class);
        });
    });
});
```

### Mapper Testing

```php
describe('CategoryMapper', function () {
    describe('toEntity', function () {
        it('converts model to entity correctly', function () {
            $model = CategoryModel::factory()->make([
                'name' => 'Test Category',
                'notes' => 'Test notes',
                'created_at' => Carbon::now()
            ]);
            $model->id = 1;

            $entity = $this->mapper->toEntity($model);

            expect($entity)
                ->toBeInstanceOf(Category::class)
                ->and($entity->getId())->toBe(1)
                ->and($entity->getName())->toBe('Test Category')
                ->and($entity->getNotes())->toBe('Test notes')
                ->and($entity->getCreatedAt())->toBeInstanceOf(Carbon::class);
        });
    });
});
```

### Exception Testing

```php
it('throws exception when category not found', function () {
    expect(fn() => $this->repository->findById(999))
        ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
});
```

## Common Pitfalls

### ❌ Don't Do This

1. **Manual model instantiation**

    ```php
    $model = new CategoryModel();
    $model->id = 1;
    $model->name = 'Test';
    ```

2. **Multiple separate expect calls**

    ```php
    expect($result)->toBeInstanceOf(Category::class);
    expect($result->getId())->toBe(1);
    expect($result->getName())->toBe('Test');
    ```

3. **Vague test names**

    ```php
    it('works', function () {});
    it('test create', function () {});
    ```

4. **Testing implementation details**

    ```php
    // Don't test private methods or internal state
    expect($this->repository->somePrivateProperty)->toBe('value');
    ```

5. **Not using factories**
    ```php
    // Don't create test data manually
    $category = new Category(name: 'Test', notes: 'Notes');
    ```

### ✅ Do This Instead

1. **Use factories**

    ```php
    $model = CategoryModel::factory()->make(['name' => 'Test']);
    ```

2. **Chain assertions**

    ```php
    expect($result)
        ->toBeInstanceOf(Category::class)
        ->and($result->getId())->toBe(1)
        ->and($result->getName())->toBe('Test');
    ```

3. **Descriptive test names**

    ```php
    it('creates new category with valid data', function () {});
    it('throws exception when category name already exists', function () {});
    ```

4. **Test behavior, not implementation**

    ```php
    // Test the public interface and expected behavior
    expect($this->repository->create($category))->toBeInstanceOf(Category::class);
    ```

5. **Use factory methods**
    ```php
    $model = CategoryModel::factory()
        ->withoutNotes()
        ->withName('Test')
        ->make();
    ```

## Memory Integration

All PHP test files should be written using PEST syntax with `describe` and `it` blocks for consistency and readability across the project.

## Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Unit/CategoryMapperTest.php

# Run with coverage
php artisan test --coverage

# Run tests in parallel
php artisan test --parallel
```

## Conclusion

Following these testing best practices ensures:

-   **Consistent test structure** across the project
-   **Readable and maintainable** test code
-   **High test coverage** with meaningful assertions
-   **Fast feedback** during development
-   **Living documentation** of system behavior

Remember: Tests should serve as both verification of correctness and documentation of expected behavior.
