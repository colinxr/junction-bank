# TICKET-013: Form Request Validation

**Estimate:** 2-3 hours  
**Priority:** High  
**Dependencies:** None  
**PRD Reference:** Lines 245-249, 315-319, 196-199, 578-589

## Overview

Create Laravel Form Request classes that handle HTTP input validation before data reaches the domain layer. These requests validate data format, types, lengths, and uniqueness constraints. They provide the first line of defense against invalid input and return clear error messages per PRD specifications.

## Technical Specifications

### Request Locations

-   `app/Http/Requests/StoreCategoryRequest.php`
-   `app/Http/Requests/UpdateCategoryRequest.php`
-   `app/Http/Requests/IndexCategoriesRequest.php`

### StoreCategoryRequest Structure (PRD Lines 245-249, 580-589)

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:categories,name',
            'type' => 'required|string|in:income,expense',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'name.string' => 'Category name must be a string.',
            'name.max' => 'Category name cannot exceed 255 characters.',
            'name.unique' => 'A category with this name already exists.',
            'type.required' => 'Category type is required.',
            'type.in' => 'Category type must be either income or expense.',
            'notes.max' => 'Category notes cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors
     */
    public function attributes(): array
    {
        return [
            'name' => 'category name',
            'type' => 'category type',
            'notes' => 'category notes',
        ];
    }
}
```

### UpdateCategoryRequest Structure (PRD Lines 315-319)

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        $categoryId = $this->route('category'); // Get ID from route

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'type' => 'sometimes|string|in:income,expense',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Category name must be a string.',
            'name.max' => 'Category name cannot exceed 255 characters.',
            'name.unique' => 'A category with this name already exists.',
            'type.in' => 'Category type must be either income or expense.',
            'notes.max' => 'Category notes cannot exceed 1000 characters.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'category name',
            'type' => 'category type',
            'notes' => 'category notes',
        ];
    }
}
```

### IndexCategoriesRequest Structure (PRD Lines 196-199)

```php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexCategoriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'page' => 'integer|min:1',
            'limit' => 'integer|min:1|max:100',
            'type' => 'string|in:income,expense',
        ];
    }

    public function messages(): array
    {
        return [
            'page.integer' => 'Page must be an integer.',
            'page.min' => 'Page must be at least 1.',
            'limit.integer' => 'Limit must be an integer.',
            'limit.min' => 'Limit must be at least 1.',
            'limit.max' => 'Limit cannot exceed 100.',
            'type.in' => 'Type must be either income or expense.',
        ];
    }

    public function attributes(): array
    {
        return [
            'page' => 'page number',
            'limit' => 'items per page',
            'type' => 'category type',
        ];
    }
}
```

### Validation Error Response Format (PRD Lines 614-623)

```json
{
    "error": {
        "message": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": {
            "name": ["The name has already been taken."],
            "type": ["Category type must be either income or expense."]
        }
    }
}
```

## Implementation Tasks

1. Create StoreCategoryRequest class
2. Implement authorization (return true)
3. Add validation rules for create
4. Add custom error messages
5. Add custom attributes
6. Create UpdateCategoryRequest class
7. Implement partial update validation (sometimes)
8. Add unique validation excluding self
9. Create IndexCategoriesRequest class
10. Add query parameter validation
11. Test all validation rules
12. Test custom error messages

## Test Cases

### StoreCategoryRequest Tests

```php
describe('StoreCategoryRequest Validation', function () {
    it('passes with valid data');
    it('fails when name is missing');
    it('fails when name exceeds 255 characters');
    it('fails when name is not unique');
    it('fails when type is missing');
    it('fails when type is invalid');
    it('passes when notes is null');
    it('fails when notes exceed 1000 characters');
    it('returns custom error messages');
});
```

### UpdateCategoryRequest Tests

```php
describe('UpdateCategoryRequest Validation', function () {
    it('passes with valid partial data');
    it('passes when updating only name');
    it('passes when updating only type');
    it('passes when updating only notes');
    it('passes with no fields (no-op)');
    it('fails when name exceeds 255 characters');
    it('fails when name conflicts with other category');
    it('passes when name unchanged');
    it('fails when type is invalid');
    it('fails when notes exceed 1000 characters');
    it('uses sometimes validation for optional fields');
    it('returns custom error messages');
});
```

### IndexCategoriesRequest Tests

```php
describe('IndexCategoriesRequest Validation', function () {
    it('passes with valid query parameters');
    it('passes with no query parameters');
    it('passes with only page parameter');
    it('passes with only limit parameter');
    it('passes with only type parameter');
    it('fails when page is less than 1');
    it('fails when page is not integer');
    it('fails when limit is less than 1');
    it('fails when limit exceeds 100');
    it('fails when limit is not integer');
    it('fails when type is invalid');
    it('returns custom error messages');
});
```

### Uniqueness Validation Tests

```php
describe('Form Request Uniqueness Validation', function () {
    it('detects duplicate names on create');
    it('excludes self on update');
    it('checks uniqueness within user scope');
    it('is case-sensitive for names');
});
```

### Error Message Tests

```php
describe('Form Request Error Messages', function () {
    it('returns clear error message for required name');
    it('returns clear error message for duplicate name');
    it('returns clear error message for invalid type');
    it('returns clear error message for long name');
    it('returns clear error message for long notes');
    it('returns multiple errors when multiple rules fail');
    it('uses custom attributes in error messages');
});
```

### Authorization Tests

```php
describe('Form Request Authorization', function () {
    it('always returns true for authorize');
    it('delegates auth to middleware');
});
```

### Edge Case Tests

```php
describe('Form Request Edge Cases', function () {
    it('handles name at exactly 255 characters');
    it('handles notes at exactly 1000 characters');
    it('handles unicode characters in name');
    it('handles special characters in notes');
    it('handles empty string vs null for notes');
    it('handles numeric page values');
    it('handles string page values');
});
```

## Acceptance Criteria

-   [ ] StoreCategoryRequest class created
-   [ ] UpdateCategoryRequest class created
-   [ ] IndexCategoriesRequest class created
-   [ ] All validation rules match PRD specifications
-   [ ] `authorize()` returns true (auth via middleware)
-   [ ] Custom error messages implemented
-   [ ] Custom attributes implemented
-   [ ] Unique validation works for create
-   [ ] Unique validation excludes self for update
-   [ ] Update uses `sometimes` for optional fields
-   [ ] Max length validation works (255, 1000)
-   [ ] Type validation enforces income/expense
-   [ ] Query parameter validation works
-   [ ] Error response format matches PRD
-   [ ] 100% test coverage
-   [ ] All 40+ test cases pass

## Validation Checklist

-   [ ] POST /categories with valid data
-   [ ] Verify passes validation
-   [ ] POST /categories with missing name
-   [ ] Verify error: "Category name is required."
-   [ ] POST /categories with name over 255 chars
-   [ ] Verify error: "Category name cannot exceed 255 characters."
-   [ ] POST /categories with duplicate name
-   [ ] Verify error: "A category with this name already exists."
-   [ ] POST /categories with invalid type "other"
-   [ ] Verify error: "Category type must be either income or expense."
-   [ ] PUT /categories/1 with new unique name
-   [ ] Verify passes validation
-   [ ] PUT /categories/1 with same name
-   [ ] Verify passes validation (excludes self)
-   [ ] PUT /categories/1 with other category's name
-   [ ] Verify error: "A category with this name already exists."
-   [ ] GET /categories?page=0
-   [ ] Verify error: "Page must be at least 1."
-   [ ] GET /categories?limit=200
-   [ ] Verify error: "Limit cannot exceed 100."
-   [ ] Run tests: `php artisan test --filter=CategoryRequestTest`

## Notes

-   Form Requests are HTTP layer - first line of validation
-   Separate from domain entity validation
-   Domain entity provides second layer of validation
-   Authorization always returns true - handled by middleware
-   Unique validation should be user-scoped (add user_id when implemented)
-   Error messages should be user-friendly
-   Error format handled by Laravel exception handler
-   Custom error messages improve UX
-   Update request uses `sometimes` for partial updates
-   Query parameter validation prevents invalid requests

## Related PRD Sections

-   **Validation Rules - Form Request (Store):** Lines 245-249, 580-589
-   **Validation Rules - Form Request (Update):** Lines 315-319
-   **Query Parameter Validation:** Lines 196-199
-   **Error Response Format:** Lines 614-623
-   **Business Rules:** Lines 528-547
-   **Layer Architecture - Interface Layer:** Lines 440-450
