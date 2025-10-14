# TICKET-003: Category Domain Entity Implementation

**Context:** Laravel banking application using Domain-Driven Design. Category entity must be framework-agnostic, containing only business logic and validation rules.

**Your Role:** Senior PHP/DDD architect implementing pure domain entities with zero infrastructure dependencies.

---

## OBJECTIVE

Implement a Category entity at `app/Domains/Categories/Entities/Category.php` that enforces all business invariants through constructor validation and immutable state changes.

---

## CONSTRAINTS

### Technical

-   **NO Laravel dependencies** (no Eloquent, no facades, no helpers)
-   **NO infrastructure concerns** (no database, HTTP, or external services)
-   **Pure PHP 8.2+** domain logic only
-   All validation in constructor - fail fast
-   Immutable after construction (state changes via methods that validate)
-   tests must be written using PEST and "describe" and "it" test helpers

### Business Rules

1. **Name**: Required, 1-500 characters, cannot be whitespace-only, trim whitespace
2. **Notes**: Optional, max 1000 characters if provided
3. **ID**: Nullable (null for new entities, int for persisted)
4. **CreatedAt**: Nullable (null for new entities, DateTimeInterface for persisted)

---

## REQUIRED DELIVERABLES

### 1. Entity Class Structure

**File:** `app/Domains/Categories/Entities/Category.php`

```php
namespace App\Domains\Categories\Entities;

class Category
{
    private ?int $id;
    private string $name;
    private ?string $notes;
    private ?\DateTimeInterface $createdAt;

    public function __construct(
        string $name,
        ?string $notes = null,
        ?int $id = null,
        ?\DateTimeInterface $createdAt = null
    ) {
        // Implementation required
    }

    private function validate(): void {
        // Validation logic
    }

    // Required methods:
    public function getId(): ?int
    public function getName(): string
    public function getNotes(): ?string
    public function getCreatedAt(): ?DateTimeInterface
    public function updateName(string $newName): void
    public function updateNotes(?string $newNotes): void
}
```

### 2. Exception Hierarchy

**Base Path:** `app/Domains/Categories/Exceptions/`

Create 6 exception classes:

1. `CategoryException` (abstract base)
2. `InvalidCategoryNameException` (empty or >255 chars)
3. `InvalidCategoryNotesException` (>1000 chars)
4. `CategoryNotFoundException`
5. `CategoryAlreadyExistsException`
6. `CategoryHasTransactionsException`

All exceptions must extend `CategoryException`, which extends `\Exception`.

### 3. Validation Logic

**Empty Name Detection:**

```php
if (empty(trim($this->name))) {
    throw new InvalidCategoryNameException('Category name cannot be empty');
}
```

**Length Validation:**

```php
if (strlen($this->name) > 255) {
    throw new InvalidCategoryNameException('Category name cannot exceed 255 characters');
}

if ($this->notes !== null && strlen($this->notes) > 1000) {
    throw new InvalidCategoryNotesException('Category notes cannot exceed 1000 characters');
}
```

**Whitespace Handling:**

-   Trim name before storage
-   Reject whitespace-only names after trimming

### 4. Business Methods

**updateName(string $newName): void**

-   Accepts new name
-   Validates using same rules as constructor
-   Updates internal state
-   Throws exceptions on validation failure

**updateNotes(?string $newNotes): void**

-   Accepts nullable notes
-   Validates if provided
-   Updates internal state
-   Throws exceptions on validation failure

---

## TEST SPECIFICATION

**Test File:** `tests/Unit/Domains/Categories/Entities/CategoryEntityTest.php`

**Framework:** Pest PHP

### Required Test Coverage (Minimum 30 Tests)

#### Name Validation

-   ✓ Throws `InvalidCategoryNameException` for empty string
-   ✓ Throws `InvalidCategoryNameException` for whitespace-only string
-   ✓ Throws `InvalidCategoryNameException` for 256 characters
-   ✓ Accepts name at exactly 255 characters
-   ✓ Accepts valid name with unicode characters
-   ✓ Trims whitespace from name edges

#### Notes Validation

-   ✓ Accepts null notes
-   ✓ Accepts valid notes
-   ✓ Accepts notes at exactly 1000 characters
-   ✓ Throws `InvalidCategoryNotesException` for 1001 characters
-   ✓ Handles special characters in notes

#### Constructor

-   ✓ Creates entity with required fields only
-   ✓ Creates entity with all fields
-   ✓ Validates immediately on construction

#### Business Methods

-   ✓ `updateName()` changes name and validates
-   ✓ `updateName()` throws on invalid name
-   ✓ `updateNotes()` changes notes and validates
-   ✓ `updateNotes()` throws on invalid notes
-   ✓ `updateNotes()` accepts null to clear notes

#### Getters

-   ✓ All getters return correct values
-   ✓ Getters preserve types (null vs string vs int)

---

## VALIDATION CHECKLIST

Before marking complete, verify:

-   [ ] Entity has NO `use Illuminate\*` imports
-   [ ] Entity has NO `use App\Models\*` imports
-   [ ] All properties are private
-   [ ] Constructor calls `$this->validate()`
-   [ ] Both business methods call `$this->validate()`
-   [ ] Name is trimmed before validation
-   [ ] Empty check happens AFTER trimming
-   [ ] All exceptions have descriptive messages
-   [ ] PHPDoc blocks on all public methods
-   [ ] `@throws` annotations on methods that throw
-   [ ] Tests run: `php artisan test --filter=CategoryEntityTest`
-   [ ] 100% code coverage achieved
-   [ ] No static analysis errors: `vendor/bin/phpstan analyse app/Domains/Categories`

---

## IMPLEMENTATION SEQUENCE

1. Create exception classes (base first, then specific)
2. Create entity class skeleton
3. Implement constructor with validation
4. Implement private `validate()` method
5. Implement all getters
6. Implement `updateName()` with validation
7. Implement `updateNotes()` with validation
8. Add comprehensive PHPDoc
9. Write unit tests (TDD: write tests as you implement)
10. Verify 100% coverage and all tests pass

---

## ANTI-PATTERNS TO AVOID

❌ Using Laravel helpers (str(), collect(), etc.)
❌ Type-hinting Eloquent models
❌ Database queries in entity
❌ HTTP concerns in entity
❌ Validation after construction (must fail in constructor)
❌ Public property access
❌ Mutable setters without validation

✅ Pure PHP
✅ Private properties
✅ Constructor validation
✅ Immutable state (validate on change)
✅ Clear exception messages
✅ Type safety

---

## SUCCESS CRITERIA

**Must achieve ALL:**

-   Entity instantiates with valid data
-   Invalid data throws appropriate exceptions immediately
-   All 30+ tests pass
-   100% code coverage
-   Zero Laravel/framework dependencies
-   PHPStan level 9 passes with no errors
-   Entity can be instantiated in any PHP project (framework-agnostic)

---

## REFERENCE: PRD SECTIONS

**Domain Model:** Lines 145-165  
**Business Rules:** Lines 528-547  
**Validation Rules:** Lines 553-575  
**Exception Hierarchy:** Lines 595-603  
**Layer Architecture:** Lines 408-417

---

## OUTPUT FORMAT

Provide implementation in this order:

1. All exception class files
2. Entity class file
3. Unit test file
4. Confirmation of test execution results

Each file must include:

-   Proper namespace
-   PHPDoc file header
-   Strict types declaration
-   Complete implementation
