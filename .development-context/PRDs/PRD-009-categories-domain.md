# Product Requirements Document (PRD)

## Categories Domain

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Development Team  
**Status:** Draft

---

## Executive Summary

The Categories domain manages transaction categorization for income and expense transactions. This domain provides CRUD operations for categories with validation rules and business constraints. It serves as a foundational domain that other domains depend on for transaction organization.

**Business Value:** Enables users to organize and analyze their financial transactions through consistent categorization  
**User Impact:** All users benefit from organized transaction management and spending analysis  
**Technical Complexity:** Low

---

## Background & Context

### Current State (Next.js)

The Categories domain is implemented with Domain-Driven Design principles using TypeScript entities, repository interfaces, and use case actions. It uses Prisma ORM with PostgreSQL and Redis caching for performance optimization.

### Target State (Laravel)

The domain will be migrated to Laravel using Eloquent ORM while preserving all business logic and validation rules. The repository pattern will be maintained with Laravel's service container for dependency injection.

### Migration Rationale

Categories is the simplest domain with no external dependencies, making it an ideal starting point for the Laravel migration. It will establish patterns and infrastructure for other domains.

---

## Objectives & Success Criteria

### Primary Objectives

1. Preserve all existing business logic and validation rules
2. Maintain identical API contract for frontend compatibility
3. Implement comprehensive test coverage using PHPUnit
4. Establish Laravel patterns for other domain migrations

### Success Metrics

| Metric            | Current | Target | Measurement Method       |
| ----------------- | ------- | ------ | ------------------------ |
| Test Coverage     | 100%    | 100%   | PHPUnit coverage reports |
| API Response Time | <50ms   | <50ms  | Load testing             |
| Cache Hit Rate    | 95%     | 95%    | Redis monitoring         |

### Definition of Done

-   [ ] All unit tests passing
-   [ ] All integration tests passing
-   [ ] API documentation updated
-   [ ] Performance benchmarks met
-   [ ] Security review completed
-   [ ] Code review approved
-   [ ] Deployment successful

---

## User Stories & Use Cases

### User Story 1: Create Category

**As a** user  
**I want to** create new income and expense categories  
**So that** I can organize my transactions

**Acceptance Criteria:**

-   [ ] Can create income category with unique name
-   [ ] Can create expense category with unique name
-   [ ] Cannot create duplicate category names
-   [ ] Category name is required and validated
-   [ ] Category type must be 'income' or 'expense'

**Technical Notes:**

-   Uses Laravel Form Request for validation
-   Entity validation preserves business rules

---

### User Story 2: Manage Categories

**As a** user  
**I want to** view, update, and delete my categories  
**So that** I can maintain my transaction organization

**Acceptance Criteria:**

-   [ ] Can list all categories with pagination
-   [ ] Can view single category details
-   [ ] Can update category name and type
-   [ ] Cannot delete category if it has transactions
-   [ ] Proper error messages for business rule violations

---

## Functional Requirements

### FR-1: Category CRUD Operations

**Priority:** Must Have  
**Description:** Complete CRUD operations for categories with business validation

**Acceptance Criteria:**

-   Create category with name, type, and optional notes
-   Read categories with pagination and filtering
-   Update category properties
-   Delete category only if no associated transactions

**Dependencies:** None

---

### FR-2: Category Validation

**Priority:** Must Have  
**Description:** Comprehensive validation for category data integrity

**Acceptance Criteria:**

-   Name is required and unique
-   Type must be 'income' or 'expense'
-   Notes are optional
-   Cannot delete categories with transactions

**Dependencies:** Transaction domain for dependency checking

---

## Non-Functional Requirements

### Performance

-   **Response Time:** API responses < 50ms for 95th percentile
-   **Throughput:** Handle 1000 requests/second
-   **Scalability:** Support 10,000 concurrent users

### Security

-   **Authentication:** Required for all operations
-   **Authorization:** Users can only access their own categories
-   **Data Protection:** Input sanitization and validation

### Reliability

-   **Availability:** 99.9% uptime
-   **Error Rate:** < 0.1% error rate
-   **Data Integrity:** Enforce unique constraints

---

## Domain Model

### Entities

```
Category
├── id: int - Primary key
├── name: string - Category name (unique)
├── type: string - 'income' or 'expense'
├── notes: string|null - Optional description
├── isRecurring: boolean - Recurring flag
└── createdAt: DateTime - Creation timestamp

Business Rules:
- Name must be unique across all categories
- Type must be 'income' or 'expense'
- Cannot delete if has associated transactions
- Cannot delete if has associated recurring transactions

Validation:
- Name required, max 255 characters
- Type must be one of: 'income', 'expense'
- Notes optional, max 1000 characters
```

### Value Objects

None

### Aggregates

Category is the aggregate root with no child entities.

### Domain Events

-   CategoryCreated
-   CategoryUpdated
-   CategoryDeleted (with validation)

---

## API Specifications

### Endpoint 1: List Categories

**Method:** GET  
**Path:** `/api/categories`  
**Auth:** Required

**Request:**

```json
{
    "page": 1,
    "limit": 20,
    "type": "expense"
}
```

**Validation:**

-   `page`: integer, min: 1
-   `limit`: integer, min: 1, max: 100
-   `type`: string, in: income,expense

**Response (200):**

```json
{
    "data": [
        {
            "id": 1,
            "name": "Groceries",
            "type": "expense",
            "notes": "Food and household items",
            "isRecurring": false,
            "createdAt": "2024-12-19T10:00:00Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 100,
        "itemsPerPage": 20
    }
}
```

**Business Logic:**

1. Authenticate user
2. Query categories for user
3. Apply pagination and filtering
4. Return formatted response

---

### Endpoint 2: Create Category

**Method:** POST  
**Path:** `/api/categories`  
**Auth:** Required

**Request:**

```json
{
    "name": "Groceries",
    "type": "expense",
    "notes": "Food and household items"
}
```

**Validation:**

-   `name`: required, string, max: 255, unique
-   `type`: required, string, in: income,expense
-   `notes`: nullable, string, max: 1000

**Response (201):**

```json
{
    "data": {
        "id": 1,
        "name": "Groceries",
        "type": "expense",
        "notes": "Food and household items",
        "isRecurring": false,
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

**Error Responses:**

-   `400`: Validation errors
-   `409`: Category name already exists

**Business Logic:**

1. Validate input data
2. Check name uniqueness
3. Create category entity
4. Persist to database
5. Invalidate cache
6. Return created category

---

### Endpoint 3: Get Category

**Method:** GET  
**Path:** `/api/categories/{id}`  
**Auth:** Required

**Response (200):**

```json
{
    "data": {
        "id": 1,
        "name": "Groceries",
        "type": "expense",
        "notes": "Food and household items",
        "isRecurring": false,
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

**Error Responses:**

-   `404`: Category not found

---

### Endpoint 4: Update Category

**Method:** PUT  
**Path:** `/api/categories/{id}`  
**Auth:** Required

**Request:**

```json
{
    "name": "Food & Groceries",
    "notes": "Updated description"
}
```

**Validation:**

-   `name`: string, max: 255, unique (if changed)
-   `type`: string, in: income,expense
-   `notes`: nullable, string, max: 1000

**Response (200):**

```json
{
    "data": {
        "id": 1,
        "name": "Food & Groceries",
        "type": "expense",
        "notes": "Updated description",
        "isRecurring": false,
        "createdAt": "2024-12-19T10:00:00Z"
    }
}
```

---

### Endpoint 5: Delete Category

**Method:** DELETE  
**Path:** `/api/categories/{id}`  
**Auth:** Required

**Response (204):** No content

**Error Responses:**

-   `404`: Category not found
-   `409`: Category has associated transactions

**Business Logic:**

1. Find category by ID
2. Check for associated transactions
3. Check for associated recurring transactions
4. Delete if no dependencies
5. Invalidate cache

---

## Data Model

### Database Tables

#### categories

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

**Columns:**
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | BIGINT | NO | AUTO | Primary key |
| name | VARCHAR(255) | NO | - | Category name |
| type | ENUM | NO | - | income or expense |
| notes | TEXT | YES | NULL | Optional description |
| is_recurring | BOOLEAN | NO | FALSE | Recurring flag |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Update time |

**Indexes:**

-   `PRIMARY KEY`: id
-   `UNIQUE KEY`: name
-   `INDEX`: type
-   `INDEX`: is_recurring

**Relationships:**

-   **Has Many:** transactions
-   **Has Many:** recurring_transactions

**Constraints:**

-   Name must be unique
-   Type must be 'income' or 'expense'

---

## Architecture & Design

### Layer Architecture

#### Domain Layer

**Entities:**

-   Category: Core business entity with validation

**Repository Interfaces:**

-   ICategoryRepository: Contract for data access

**Domain Services:**

-   None

#### Application Layer

**Use Cases (Actions):**

-   IndexCategories: List categories with pagination
-   ShowCategory: Get single category
-   StoreCategory: Create new category
-   UpdateCategory: Modify existing category
-   DeleteCategory: Remove category

**DTOs:**

-   CategoryDTO: Data transfer object
-   CategoryListDTO: Paginated list response

#### Infrastructure Layer

**Repository Implementations:**

-   CategoryRepository: Eloquent implementation with Redis caching

**External Services:**

-   None

**Mappers:**

-   CategoryMapper: Entity ↔ Database model transformation

#### Interface Layer

**Controllers:**

-   CategoryController: Handles all category routes

**Middleware:**

-   AuthMiddleware: Authentication
-   ValidateCategoryMiddleware: Business rule validation

**Form Requests:**

-   StoreCategoryRequest: Create validation
-   UpdateCategoryRequest: Update validation

---

### Design Patterns

**Patterns Used:**

1. **Repository Pattern**: Data access abstraction
2. **Service Layer**: Business logic encapsulation
3. **DTO Pattern**: Data transfer objects
4. **Caching Pattern**: Redis for performance

---

### Dependency Injection

**Service Bindings:**

```php
// In AppServiceProvider
$this->app->singleton(ICategoryRepository::class, function ($app) {
    return new CategoryRepository(
        $app->make('db'),
        $app->make('redis')
    );
});
```

**Action/Service Bindings:**

```php
$this->app->bind(IndexCategoriesService::class, function ($app) {
    return new IndexCategoriesService(
        $app->make(ICategoryRepository::class)
    );
});
```

---

## Integration Points

### Dependencies (What this depends on)

1. **User Authentication**: For user-scoped operations
2. **Database**: PostgreSQL for persistence
3. **Cache**: Redis for performance

### Dependents (What depends on this)

1. **Transactions Domain**: Uses categories for transaction categorization
2. **RecurringTransactions Domain**: Uses categories for recurring patterns
3. **Analytics**: Category-based spending analysis

### External Services

None

---

## Caching Strategy

### Cache Keys

```
categories:list:{user_id}:{page}:{limit}:{type}    # Paginated lists
categories:{id}                                     # Single category
categories:user:{user_id}                          # All user categories
```

### Cache TTL

-   List queries: 1 hour
-   Single category: 24 hours
-   User categories: 1 hour

### Invalidation Rules

**Trigger:** Create, Update, Delete  
**Invalidate:**

-   `categories:list:{user_id}:*`
-   `categories:{id}`
-   `categories:user:{user_id}`

---

## Business Logic & Rules

### Rule 1: Unique Category Names

**Description:** Each category name must be unique within the system  
**Triggers:** Create and update operations  
**Implementation:** Database unique constraint + application validation  
**Exceptions:** None

### Rule 2: Category Deletion Protection

**Description:** Cannot delete categories with associated transactions or recurring transactions  
**Triggers:** Delete operation  
**Implementation:** Check foreign key constraints before deletion  
**Exceptions:** None

### Rule 3: Category Type Validation

**Description:** Category type must be either 'income' or 'expense'  
**Triggers:** Create and update operations  
**Implementation:** Enum constraint + form validation  
**Exceptions:** None

---

## Validation Rules

### Entity Validation (Domain Layer)

```php
class Category {
    private function validate(): void {
        // Name validation
        if (empty($this->name)) {
            throw new CategoryNameEmptyException('Category name is required');
        }

        if (strlen($this->name) > 255) {
            throw new InvalidCategoryNameException('Category name too long');
        }

        // Notes validation
        if ($this->notes && strlen($this->notes) > 1000) {
            throw new InvalidCategoryNotesException('Category notes too long');
        }
    }
}
```

### Input Validation (Form Requests)

```php
class StoreCategoryRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|max:255|unique:categories,name',
            'type' => 'required|string|in:income,expense',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
```

---

## Error Handling

### Exception Hierarchy

```
CategoryException
├── CategoryNotFoundException
├── CategoryAlreadyExistsException
├── CategoryHasTransactionsException
├── InvalidCategoryTypeException
└── CategoryNameEmptyException
```

### Error Codes

| Code                      | Exception                        | HTTP Status | Message                                  |
| ------------------------- | -------------------------------- | ----------- | ---------------------------------------- |
| CATEGORY_NOT_FOUND        | CategoryNotFoundException        | 404         | Category not found                       |
| CATEGORY_EXISTS           | CategoryAlreadyExistsException   | 409         | Category name already exists             |
| CATEGORY_HAS_TRANSACTIONS | CategoryHasTransactionsException | 409         | Cannot delete category with transactions |

### Error Response Format

```json
{
    "error": {
        "message": "Category name already exists",
        "code": "CATEGORY_EXISTS",
        "details": {
            "name": ["The name has already been taken."]
        }
    }
}
```

---

## Testing Strategy

### Unit Tests

**Coverage Target:** 100%

**Test Cases:**

1. **Entity Tests**

    - [ ] Validation rules
    - [ ] Business methods
    - [ ] Edge cases

2. **Use Case Tests**

    - [ ] Happy path scenarios
    - [ ] Error conditions
    - [ ] Boundary conditions

3. **Repository Tests**
    - [ ] CRUD operations
    - [ ] Query methods
    - [ ] Cache behavior

### Integration Tests

**Test Cases:**

1. **API Endpoint Tests**

    - [ ] Authentication
    - [ ] Request validation
    - [ ] Response format
    - [ ] Error handling

2. **Database Tests**

    - [ ] Migrations
    - [ ] Relationships
    - [ ] Constraints

3. **Cache Tests**
    - [ ] Cache hits
    - [ ] Cache misses
    - [ ] Invalidation

---

## Security Considerations

### Authentication

-   Laravel Sanctum for API authentication
-   User-scoped operations only

### Authorization

-   Users can only access their own categories
-   No cross-user data access

### Input Validation

-   XSS prevention through input sanitization
-   SQL injection prevention through Eloquent ORM
-   CSRF protection for web routes

### Data Protection

-   No sensitive data stored
-   Input validation and sanitization

---

## Migration Plan

### Phase 1: Foundation Setup

**Duration:** 1 day  
**Goal:** Set up basic Laravel structure

**Tasks:**

1. [ ] Create Laravel project structure
2. [ ] Set up database migrations
3. [ ] Configure Redis caching
4. [ ] Set up testing framework

**Deliverables:**

-   Database schema
-   Basic project structure
-   Testing configuration

**Dependencies:** None

---

### Phase 2: Domain Implementation

**Duration:** 2 days  
**Goal:** Implement core domain logic

**Tasks:**

1. [ ] Create Category entity
2. [ ] Implement repository interface
3. [ ] Create Eloquent repository
4. [ ] Implement use case services
5. [ ] Add validation rules

**Deliverables:**

-   Complete domain layer
-   Repository implementation
-   Business logic validation

**Dependencies:** Phase 1

---

### Phase 3: API Implementation

**Duration:** 1 day  
**Goal:** Create API endpoints

**Tasks:**

1. [ ] Create CategoryController
2. [ ] Implement form requests
3. [ ] Add middleware
4. [ ] Configure routes
5. [ ] Add API documentation

**Deliverables:**

-   Complete API layer
-   Request validation
-   Route configuration

**Dependencies:** Phase 2

---

### Phase 4: Testing & Validation

**Duration:** 1 day  
**Goal:** Comprehensive testing

**Tasks:**

1. [ ] Write unit tests
2. [ ] Write integration tests
3. [ ] Performance testing
4. [ ] Security testing
5. [ ] Code review

**Deliverables:**

-   Test suite
-   Performance benchmarks
-   Security validation

**Dependencies:** Phase 3

---

## Data Migration

### Source Data

**Current System:** Next.js + Prisma  
**Database:** PostgreSQL  
**Tables:** categories

### Transformation Rules

1. **Field mapping**: Direct mapping, no transformation needed
2. **User association**: Add user_id column for Laravel auth

### Migration Script

```bash
# Create Laravel migration
php artisan make:migration create_categories_table

# Add user_id column
php artisan make:migration add_user_id_to_categories_table
```

### Validation

-   [ ] Record count matches
-   [ ] Data integrity checks
-   [ ] Relationship preservation
-   [ ] No data loss

---

## Deployment Plan

### Pre-Deployment

-   [ ] Code freeze
-   [ ] Final testing in staging
-   [ ] Database backup
-   [ ] Rollback plan ready

### Deployment Steps

1. [ ] Deploy Laravel application
2. [ ] Run database migrations
3. [ ] Update API endpoints
4. [ ] Verify functionality

### Post-Deployment

-   [ ] Smoke tests
-   [ ] Monitor error rates
-   [ ] Performance monitoring
-   [ ] User acceptance testing

---

## Risks & Mitigation

| Risk                       | Probability | Impact | Mitigation Strategy               |
| -------------------------- | ----------- | ------ | --------------------------------- |
| Data loss during migration | Low         | High   | Comprehensive backups and testing |
| Performance degradation    | Low         | Medium | Load testing and optimization     |
| API contract changes       | Low         | High   | Maintain identical API structure  |

---

## Timeline & Milestones

| Milestone             | Target Date | Status      | Owner    |
| --------------------- | ----------- | ----------- | -------- |
| Foundation Setup      | Day 1       | Not Started | Dev Team |
| Domain Implementation | Day 3       | Not Started | Dev Team |
| API Implementation    | Day 4       | Not Started | Dev Team |
| Testing & Validation  | Day 5       | Not Started | Dev Team |

**Estimated Effort:** 5 days

---

## Assumptions & Constraints

### Assumptions

1. Laravel 11.x will be used
2. PostgreSQL database will be maintained
3. Redis caching will be preserved
4. Frontend will remain unchanged initially

### Constraints

1. Must maintain API compatibility
2. No data loss during migration
3. Performance must match or exceed current system

---

## Appendix

### Glossary

-   **Category**: A classification for transactions (income or expense)
-   **Repository Pattern**: Data access abstraction layer
-   **Use Case**: Business operation implementation

### References

-   Backend Analysis Report
-   Laravel Documentation
-   Domain-Driven Design Principles

### Related Documents

-   PRD-010-transactions-domain.md
-   PRD-012-recurring-transactions-domain.md
-   API specification document

---

## Change Log

| Version | Date       | Author   | Changes       |
| ------- | ---------- | -------- | ------------- |
| 1.0     | 2024-12-19 | Dev Team | Initial draft |

---

**End of PRD**
