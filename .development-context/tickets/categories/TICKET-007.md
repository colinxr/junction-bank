# TICKET-007: Category Mapper

**Estimate:** 2-3 hours  
**Priority:** High  
**Dependencies:** TICKET-003, TICKET-006  
**PRD Reference:** Lines 437-439, 427-428

## Overview

Create the CategoryMapper class that handles transformations between different data representations: Eloquent models, Domain entities, and DTOs. This mapper ensures clean separation between layers and provides consistent data transformation logic.

## Technical Specifications

### Mapper Location

`app/Domains/Categories/Infrastructure/Mappers/CategoryMapper.php`

### Mapper Structure

```php
namespace App\Domains\Categories\Infrastructure\Mappers;

use App\Domains\Categories\Entities\Category;
use App\Models\Category as CategoryModel;

class CategoryMapper
{
    /**
     * Convert Eloquent model to Domain entity
     */
    public function toEntity(CategoryModel $model): Category
    {
        return new Category(
            name: $model->name,
            type: $model->type,
            notes: $model->notes,
            isRecurring: $model->is_recurring,
            id: $model->id,
            createdAt: $model->created_at
        );
    }

    /**
     * Convert Domain entity to Eloquent model
     * Note: Does not set user_id - caller must set this
     */
    public function toModel(Category $entity): CategoryModel
    {
        $model = new CategoryModel();

        if ($entity->getId() !== null) {
            $model->id = $entity->getId();
            $model->exists = true;
        }

        $model->name = $entity->getName();
        $model->type = $entity->getType();
        $model->notes = $entity->getNotes();
        $model->is_recurring = $entity->isRecurring();

        return $model;
    }

    /**
     * Convert entity to DTO for API response
     */
    public function toDTO(Category $entity): array
    {
        return [
            'id' => $entity->getId(),
            'name' => $entity->getName(),
            'type' => $entity->getType(),
            'notes' => $entity->getNotes(),
            'isRecurring' => $entity->isRecurring(),
            'createdAt' => $entity->getCreatedAt()?->format('Y-m-d\TH:i:s\Z'),
        ];
    }

    /**
     * Convert multiple entities to DTOs
     */
    public function toDTOCollection(array $entities): array
    {
        return array_map(fn($entity) => $this->toDTO($entity), $entities);
    }
}
```

### DTO Structure (PRD Lines 427-428)

API Response format matches PRD lines 202-221:

```json
{
    "id": 1,
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items",
    "isRecurring": false,
    "createdAt": "2024-12-19T10:00:00Z"
}
```

## Implementation Tasks

1. Create CategoryMapper class
2. Implement `toEntity()` method
3. Implement `toModel()` method
4. Implement `toDTO()` method
5. Implement `toDTOCollection()` helper
6. Handle null values correctly
7. Format dates to ISO 8601
8. Add comprehensive PHPDoc
9. Write unit tests for all methods

## Test Cases

### toEntity() Transformation Tests

```php
describe('CategoryMapper toEntity()', function () {
    it('converts model to entity with all fields');
    it('converts model to entity with null notes');
    it('converts model with id to entity');
    it('preserves created_at timestamp');
    it('converts is_recurring boolean correctly');
    it('handles minimal model data');
});
```

### toModel() Transformation Tests

```php
describe('CategoryMapper toModel()', function () {
    it('converts entity to new model');
    it('converts entity with id to existing model');
    it('converts entity with null notes');
    it('sets exists flag when id present');
    it('does not set user_id automatically');
    it('preserves all entity data');
    it('handles entity with null id');
});
```

### toDTO() Transformation Tests

```php
describe('CategoryMapper toDTO()', function () {
    it('converts entity to DTO array');
    it('formats createdAt as ISO 8601 string');
    it('includes all required fields');
    it('handles null notes in DTO');
    it('handles null createdAt in DTO');
    it('uses camelCase for field names');
    it('converts boolean isRecurring correctly');
});
```

### toDTOCollection() Tests

```php
describe('CategoryMapper toDTOCollection()', function () {
    it('converts array of entities to array of DTOs');
    it('handles empty array');
    it('maintains array order');
    it('applies toDTO transformation to each entity');
});
```

### Null Handling Tests

```php
describe('CategoryMapper Null Handling', function () {
    it('handles null notes in toEntity');
    it('handles null notes in toModel');
    it('handles null notes in toDTO');
    it('handles null id in toModel');
    it('handles null createdAt in toDTO');
});
```

### Date Formatting Tests

```php
describe('CategoryMapper Date Formatting', function () {
    it('formats date as ISO 8601 in toDTO');
    it('includes timezone in formatted date');
    it('handles different timezones correctly');
    it('preserves DateTime object in toEntity');
    it('returns null when createdAt is null');
});
```

### Bidirectional Transformation Tests

```php
describe('CategoryMapper Bidirectional Transformation', function () {
    it('maintains data integrity in model->entity->model cycle');
    it('maintains data integrity in entity->DTO transformation');
    it('preserves all required fields through transformations');
});
```

## Acceptance Criteria

-   [ ] CategoryMapper class created at correct location
-   [ ] `toEntity()` method implemented
-   [ ] `toModel()` method implemented
-   [ ] `toDTO()` method implemented
-   [ ] `toDTOCollection()` helper implemented
-   [ ] Null values handled correctly in all methods
-   [ ] Date formatting uses ISO 8601 standard
-   [ ] DTO uses camelCase field names per PRD
-   [ ] PHPDoc on all methods
-   [ ] 100% unit test coverage
-   [ ] All 25+ test cases pass

## Validation Checklist

-   [ ] Create model, convert to entity, verify all fields
-   [ ] Create entity, convert to model, verify all fields
-   [ ] Create entity, convert to DTO, verify JSON structure
-   [ ] Test null notes through all transformations
-   [ ] Verify date format: `2024-12-19T10:00:00Z`
-   [ ] Run tests: `php artisan test --filter=CategoryMapperTest`

## Notes

-   Mapper is infrastructure layer component
-   No business logic - pure data transformation
-   `toModel()` does NOT set `user_id` - caller responsibility
-   Date format must match frontend expectations
-   DTO field names use camelCase per JavaScript conventions
-   Consider adding validation that entity data is complete

## Related PRD Sections

-   **Mappers:** Lines 437-439
-   **DTOs:** Lines 427-428
-   **API Response Format:** Lines 202-221, 250-262
-   **Date Formatting:** Consistent with API specifications
