# Product Requirements Document (PRD)
## Authentication Migration

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Development Team  
**Status:** Draft

---

## Executive Summary

The Authentication Migration PRD outlines the migration from Clerk-based authentication to Laravel's default authentication system. This migration affects all domains and requires careful data transformation, API updates, and frontend integration changes.

**Business Value:** Reduces external dependencies and provides full control over authentication  
**User Impact:** Users will experience seamless authentication with improved security  
**Technical Complexity:** High

---

## Background & Context

### Current State (Next.js)
The application currently uses Clerk for authentication with `clerkId` as the user identifier. All domains (Transactions, RecurringTransactions, Categories, Months) reference users via `clerkId` string values.

### Target State (Laravel)
The application will use Laravel's default authentication system with Laravel Sanctum for API authentication. User identifiers will change from `clerkId` strings to Laravel's `user_id` integers.

### Migration Rationale
Moving to Laravel's authentication system provides better control, reduced external dependencies, improved security, and better integration with Laravel's ecosystem.

---

## Objectives & Success Criteria

### Primary Objectives
1. Migrate all user data from Clerk to Laravel authentication
2. Update all domain models to use `user_id` instead of `clerkId`
3. Implement Laravel Sanctum for API authentication
4. Maintain seamless user experience during migration
5. Preserve all user data and relationships

### Success Metrics
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| User Migration Success Rate | N/A | 100% | Migration validation |
| API Authentication Success | 100% | 100% | Authentication tests |
| Data Integrity | 100% | 100% | Data validation |
| User Experience Impact | N/A | 0% | User feedback |

### Definition of Done
- [ ] All user data migrated successfully
- [ ] All domain models updated
- [ ] API authentication working
- [ ] Frontend integration updated
- [ ] All tests passing
- [ ] Security review completed
- [ ] Code review approved
- [ ] Deployment successful

---

## User Stories & Use Cases

### User Story 1: User Data Migration
**As a** system administrator  
**I want to** migrate all user data from Clerk to Laravel  
**So that** users can continue using the application seamlessly

**Acceptance Criteria:**
- [ ] Export all user data from Clerk
- [ ] Create corresponding Laravel users
- [ ] Map `clerkId` to new `user_id`
- [ ] Validate data integrity
- [ ] Preserve all user relationships

**Technical Notes:**
- Data export from Clerk API
- User creation in Laravel
- ID mapping and validation

---

### User Story 2: Domain Model Updates
**As a** developer  
**I want to** update all domain models to use `user_id`  
**So that** the application works with Laravel authentication

**Acceptance Criteria:**
- [ ] Update Transactions domain
- [ ] Update RecurringTransactions domain
- [ ] Update Categories domain
- [ ] Update Months domain
- [ ] Update database schema
- [ ] Update all references

**Technical Notes:**
- Database schema changes
- Domain model updates
- Repository updates

---

### User Story 3: API Authentication
**As a** developer  
**I want to** implement Laravel Sanctum for API authentication  
**So that** the frontend can authenticate with the Laravel backend

**Acceptance Criteria:**
- [ ] Configure Laravel Sanctum
- [ ] Implement authentication middleware
- [ ] Update API routes
- [ ] Handle token management
- [ ] Provide authentication endpoints

**Technical Notes:**
- Laravel Sanctum configuration
- Middleware implementation
- Token management

---

## Functional Requirements

### FR-1: User Data Migration
**Priority:** Must Have  
**Description:** Migrate all user data from Clerk to Laravel

**Acceptance Criteria:**
- Export user data from Clerk
- Create Laravel users
- Map `clerkId` to `user_id`
- Validate data integrity
- Preserve relationships

**Dependencies:** Clerk API access

---

### FR-2: Database Schema Updates
**Priority:** Must Have  
**Description:** Update database schema to use `user_id`

**Acceptance Criteria:**
- Add `user_id` columns to all tables
- Update foreign key constraints
- Update indexes
- Migrate existing data
- Validate schema integrity

**Dependencies:** User data migration

---

### FR-3: Domain Model Updates
**Priority:** Must Have  
**Description:** Update all domain models to use `user_id`

**Acceptance Criteria:**
- Update Transactions domain
- Update RecurringTransactions domain
- Update Categories domain
- Update Months domain
- Update all references
- Maintain business logic

**Dependencies:** Database schema updates

---

### FR-4: API Authentication Implementation
**Priority:** Must Have  
**Description:** Implement Laravel Sanctum for API authentication

**Acceptance Criteria:**
- Configure Laravel Sanctum
- Implement authentication middleware
- Update API routes
- Handle token management
- Provide authentication endpoints

**Dependencies:** Domain model updates

---

## Non-Functional Requirements

### Performance
- **Migration Time:** Complete migration < 2 hours
- **API Response Time:** Authentication < 100ms
- **Scalability:** Support 10,000 concurrent users
- **Token Management:** Token validation < 50ms

### Security
- **Authentication:** Laravel Sanctum tokens
- **Authorization:** User-scoped operations
- **Data Protection:** Secure user data migration
- **Token Security:** Secure token management

### Reliability
- **Availability:** 99.9% uptime during migration
- **Error Rate:** < 0.1% error rate
- **Data Integrity:** 100% data preservation
- **Migration Reliability:** 100% successful migration

---

## Domain Model

### Entities
```
User (Laravel)
├── id: int - Primary key
├── name: string - User name
├── email: string - User email
├── email_verified_at: DateTime|null - Email verification
├── password: string - Hashed password
├── remember_token: string|null - Remember token
├── created_at: DateTime - Creation timestamp
└── updated_at: DateTime - Update timestamp

Business Rules:
- Email must be unique
- Password must be hashed
- Email verification optional
- Name required

Validation:
- Name required, max 255 characters
- Email required, valid email format, unique
- Password required, min 8 characters
```

### Value Objects
```
AuthenticationToken
├── token: string - Sanctum token
├── expiresAt: DateTime - Token expiration
├── userId: int - User identifier
└── isValid: boolean - Token validity

UserSession
├── userId: int - User identifier
├── token: string - Session token
├── createdAt: DateTime - Session creation
└── lastActivity: DateTime - Last activity
```

### Aggregates
User is the aggregate root with relationships to all domain entities.

### Domain Events
- UserCreated
- UserUpdated
- UserDeleted
- UserAuthenticated
- UserLoggedOut
- TokenGenerated
- TokenRevoked

---

## API Specifications

### Endpoint 1: User Registration
**Method:** POST  
**Path:** `/api/auth/register`  
**Auth:** None

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Validation:**
- `name`: required, string, max: 255
- `email`: required, email, unique:users
- `password`: required, string, min: 8, confirmed

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "email_verified_at": null,
      "created_at": "2024-12-19T10:00:00Z"
    },
    "token": "1|abcdef1234567890"
  }
}
```

**Business Logic:**
1. Validate input data
2. Check email uniqueness
3. Hash password
4. Create user
5. Generate Sanctum token
6. Return user and token

---

### Endpoint 2: User Login
**Method:** POST  
**Path:** `/api/auth/login`  
**Auth:** None

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: required, email
- `password`: required, string

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "email_verified_at": "2024-12-19T10:00:00Z",
      "created_at": "2024-12-19T10:00:00Z"
    },
    "token": "2|fedcba0987654321"
  }
}
```

**Business Logic:**
1. Validate credentials
2. Authenticate user
3. Generate Sanctum token
4. Return user and token

---

### Endpoint 3: User Logout
**Method:** POST  
**Path:** `/api/auth/logout`  
**Auth:** Required

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

**Business Logic:**
1. Authenticate user
2. Revoke current token
3. Return success message

---

### Endpoint 4: Get Current User
**Method:** GET  
**Path:** `/api/auth/user`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2024-12-19T10:00:00Z",
    "created_at": "2024-12-19T10:00:00Z"
  }
}
```

**Business Logic:**
1. Authenticate user
2. Return user data

---

## Data Model

### Database Tables

#### users
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
);
```

**Columns:**
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | BIGINT | NO | AUTO | Primary key |
| name | VARCHAR(255) | NO | - | User name |
| email | VARCHAR(255) | NO | - | User email |
| email_verified_at | TIMESTAMP | YES | NULL | Email verification |
| password | VARCHAR(255) | NO | - | Hashed password |
| remember_token | VARCHAR(100) | YES | NULL | Remember token |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Update time |

#### personal_access_tokens
```sql
CREATE TABLE personal_access_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
);
```

#### Migration Tables
```sql
-- Add user_id columns to existing tables
ALTER TABLE transactions ADD COLUMN user_id BIGINT NOT NULL AFTER id;
ALTER TABLE recurring_transactions ADD COLUMN user_id BIGINT NOT NULL AFTER id;

-- Update foreign key constraints
ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE recurring_transactions ADD FOREIGN KEY (user_id) REFERENCES users(id);

-- Update indexes
ALTER TABLE transactions ADD INDEX idx_user_id (user_id);
ALTER TABLE recurring_transactions ADD INDEX idx_user_id (user_id);

-- Remove old clerk_id columns (after data migration)
ALTER TABLE transactions DROP COLUMN clerk_id;
ALTER TABLE recurring_transactions DROP COLUMN clerk_id;
```

---

## Architecture & Design

### Layer Architecture

#### Domain Layer
**Entities:**
- User: Core authentication entity

**Repository Interfaces:**
- IUserRepository: Contract for user data access

**Domain Services:**
- AuthenticationService: Authentication logic
- TokenService: Token management

#### Application Layer
**Use Cases (Actions):**
- RegisterUser: User registration
- LoginUser: User authentication
- LogoutUser: User logout
- GetCurrentUser: Get authenticated user
- RefreshToken: Token refresh

**DTOs:**
- UserDTO: Data transfer object
- AuthenticationDTO: Authentication result
- TokenDTO: Token information

#### Infrastructure Layer
**Repository Implementations:**
- UserRepository: Eloquent implementation

**External Services:**
- ClerkApiService: Clerk data export

**Mappers:**
- UserMapper: Entity ↔ Database model transformation

#### Interface Layer
**Controllers:**
- AuthController: Handles authentication routes

**Middleware:**
- AuthMiddleware: Authentication
- SanctumMiddleware: Sanctum token validation

**Form Requests:**
- RegisterRequest: Registration validation
- LoginRequest: Login validation

---

### Design Patterns

**Patterns Used:**
1. **Repository Pattern**: Data access abstraction
2. **Service Layer**: Business logic encapsulation
3. **DTO Pattern**: Data transfer objects
4. **Token Pattern**: Sanctum token management
5. **Migration Pattern**: Data migration strategy

---

### Dependency Injection

**Service Bindings:**
```php
// In AppServiceProvider
$this->app->singleton(IUserRepository::class, function ($app) {
    return new UserRepository($app->make('db'));
});

$this->app->singleton(AuthenticationService::class, function ($app) {
    return new AuthenticationService(
        $app->make(IUserRepository::class),
        $app->make('hash')
    );
});

$this->app->singleton(TokenService::class, function ($app) {
    return new TokenService($app->make('sanctum'));
});
```

---

## Integration Points

### Dependencies (What this depends on)
1. **Clerk API**: For user data export
2. **Laravel Sanctum**: For API authentication
3. **Database**: For user persistence
4. **All Domains**: For user reference updates

### Dependents (What depends on this)
1. **All Domains**: Use user authentication
2. **Frontend**: Authentication integration
3. **API Routes**: Authentication middleware

### External Services
1. **Clerk API**: For user data export
2. **Laravel Sanctum**: For token management

---

## Caching Strategy

### Cache Keys
```
user:{id}                                    # Single user
user:email:{email}                           # User by email
user:token:{token}                           # User by token
```

### Cache TTL
- User data: 1 hour
- User by email: 30 minutes
- User by token: 15 minutes

### Invalidation Rules
**Trigger:** User update, token generation/revocation  
**Invalidate:**
- `user:{id}`
- `user:email:{email}`
- `user:token:{token}`

---

## Business Logic & Rules

### Rule 1: User Data Migration
**Description:** All user data must be migrated from Clerk to Laravel  
**Triggers:** Migration process  
**Implementation:** Export from Clerk, import to Laravel  
**Exceptions:** None

### Rule 2: ID Mapping
**Description:** `clerkId` must be mapped to `user_id` consistently  
**Triggers:** Data migration  
**Implementation:** Maintain mapping table during migration  
**Exceptions:** None

### Rule 3: Token Management
**Description:** Sanctum tokens must be managed securely  
**Triggers:** Authentication operations  
**Implementation:** Token generation, validation, and revocation  
**Exceptions:** None

### Rule 4: Domain Updates
**Description:** All domains must use `user_id` instead of `clerkId`  
**Triggers:** Domain updates  
**Implementation:** Update all references and relationships  
**Exceptions:** None

---

## Validation Rules

### Entity Validation (Domain Layer)
```php
class User {
    private function validate(): void {
        // Name validation
        if (empty($this->name)) {
            throw new InvalidUserNameException('Name is required');
        }
        
        if (strlen($this->name) > 255) {
            throw new InvalidUserNameException('Name too long');
        }
        
        // Email validation
        if (empty($this->email)) {
            throw new InvalidEmailException('Email is required');
        }
        
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException('Invalid email format');
        }
        
        // Password validation
        if (empty($this->password)) {
            throw new InvalidPasswordException('Password is required');
        }
        
        if (strlen($this->password) < 8) {
            throw new InvalidPasswordException('Password too short');
        }
    }
}
```

### Input Validation (Form Requests)
```php
class RegisterRequest extends FormRequest {
    public function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
```

---

## Error Handling

### Exception Hierarchy
```
AuthenticationException
├── UserNotFoundException
├── InvalidCredentialsException
├── InvalidTokenException
├── TokenExpiredException
├── UserAlreadyExistsException
├── InvalidUserNameException
├── InvalidEmailException
└── InvalidPasswordException
```

### Error Codes
| Code | Exception | HTTP Status | Message |
|------|-----------|-------------|---------|
| USER_NOT_FOUND | UserNotFoundException | 404 | User not found |
| INVALID_CREDENTIALS | InvalidCredentialsException | 401 | Invalid credentials |
| INVALID_TOKEN | InvalidTokenException | 401 | Invalid token |
| TOKEN_EXPIRED | TokenExpiredException | 401 | Token expired |
| USER_EXISTS | UserAlreadyExistsException | 409 | User already exists |

### Error Response Format
```json
{
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS",
    "details": {
      "email": ["The provided credentials are incorrect."]
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
   - [ ] Authentication flows

3. **Repository Tests**
   - [ ] CRUD operations
   - [ ] Query methods
   - [ ] Cache behavior

4. **Service Tests**
   - [ ] Authentication logic
   - [ ] Token management
   - [ ] Error handling

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
   - [ ] Data integrity

3. **Token Tests**
   - [ ] Token generation
   - [ ] Token validation
   - [ ] Token revocation

### Feature Tests
**Test Cases:**
1. **End-to-End Workflow Tests**
   - [ ] Complete authentication workflow
   - [ ] User registration workflow
   - [ ] Token management workflow
   - [ ] Migration workflow

### Performance Tests
**Benchmarks:**
- [ ] API response time < 100ms
- [ ] Authentication < 50ms
- [ ] Token validation < 25ms
- [ ] Memory usage < 256MB

---

## Security Considerations

### Authentication
- Laravel Sanctum for API authentication
- Secure token management
- Password hashing with bcrypt

### Authorization
- User-scoped operations only
- No cross-user data access
- Token-based authorization

### Input Validation
- XSS prevention through input sanitization
- SQL injection prevention through Eloquent ORM
- Input validation and sanitization

### Data Protection
- Secure user data migration
- Password hashing
- Token security

---

## Migration Plan

### Phase 1: Preparation
**Duration:** 2 days  
**Goal:** Prepare for migration

**Tasks:**
1. [ ] Export user data from Clerk
2. [ ] Create Laravel user migration
3. [ ] Prepare data mapping
4. [ ] Set up testing environment
5. [ ] Create rollback plan

**Deliverables:**
- User data export
- Migration scripts
- Data mapping
- Testing environment

**Dependencies:** None

---

### Phase 2: Database Schema Updates
**Duration:** 1 day  
**Goal:** Update database schema

**Tasks:**
1. [ ] Add `user_id` columns
2. [ ] Update foreign key constraints
3. [ ] Update indexes
4. [ ] Validate schema
5. [ ] Test schema changes

**Deliverables:**
- Updated database schema
- Migration scripts
- Schema validation

**Dependencies:** Phase 1

---

### Phase 3: User Data Migration
**Duration:** 1 day  
**Goal:** Migrate user data

**Tasks:**
1. [ ] Create Laravel users
2. [ ] Map `clerkId` to `user_id`
3. [ ] Update all references
4. [ ] Validate data integrity
5. [ ] Test migration

**Deliverables:**
- Migrated user data
- Data mapping
- Validation results

**Dependencies:** Phase 2

---

### Phase 4: Domain Model Updates
**Duration:** 2 days  
**Goal:** Update all domain models

**Tasks:**
1. [ ] Update Transactions domain
2. [ ] Update RecurringTransactions domain
3. [ ] Update Categories domain
4. [ ] Update Months domain
5. [ ] Update all references
6. [ ] Test domain updates

**Deliverables:**
- Updated domain models
- Repository updates
- Business logic validation

**Dependencies:** Phase 3

---

### Phase 5: API Authentication Implementation
**Duration:** 2 days  
**Goal:** Implement Laravel Sanctum

**Tasks:**
1. [ ] Configure Laravel Sanctum
2. [ ] Implement authentication middleware
3. [ ] Update API routes
4. [ ] Handle token management
5. [ ] Provide authentication endpoints
6. [ ] Test authentication

**Deliverables:**
- Laravel Sanctum configuration
- Authentication middleware
- API endpoints
- Token management

**Dependencies:** Phase 4

---

### Phase 6: Testing & Validation
**Duration:** 2 days  
**Goal:** Comprehensive testing

**Tasks:**
1. [ ] Write unit tests
2. [ ] Write integration tests
3. [ ] Performance testing
4. [ ] Security testing
5. [ ] Code review
6. [ ] Migration validation

**Deliverables:**
- Test suite
- Performance benchmarks
- Security validation
- Migration validation

**Dependencies:** Phase 5

---

## Data Migration

### Source Data
**Current System:** Clerk authentication  
**Database:** PostgreSQL  
**Tables:** transactions, recurring_transactions

### Transformation Rules
1. **User mapping**: Export from Clerk, create Laravel users
2. **ID mapping**: Map `clerkId` to `user_id`
3. **Data preservation**: Maintain all user relationships
4. **Schema updates**: Add `user_id` columns, remove `clerkId`

### Migration Script
```bash
# Export user data from Clerk
php artisan clerk:export-users

# Create Laravel users
php artisan users:import-from-clerk

# Update domain references
php artisan domains:update-user-references

# Validate migration
php artisan migration:validate
```

### Validation
- [ ] All users migrated
- [ ] Data integrity preserved
- [ ] Relationships maintained
- [ ] No data loss
- [ ] Authentication working

---

## Deployment Plan

### Pre-Deployment
- [ ] Code freeze
- [ ] Final testing in staging
- [ ] Database backup
- [ ] Rollback plan ready
- [ ] Migration validation

### Deployment Steps
1. [ ] Deploy Laravel application
2. [ ] Run database migrations
3. [ ] Execute user data migration
4. [ ] Update domain references
5. [ ] Verify authentication
6. [ ] Test all functionality

### Post-Deployment
- [ ] Smoke tests
- [ ] Monitor error rates
- [ ] Performance monitoring
- [ ] User acceptance testing
- [ ] Authentication validation

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Data loss during migration | Medium | High | Comprehensive backups and testing |
| Authentication failures | Medium | High | Extensive testing and validation |
| User experience disruption | Low | Medium | Seamless migration process |
| Performance degradation | Low | Medium | Load testing and optimization |

---

## Timeline & Milestones

| Milestone | Target Date | Status | Owner |
|-----------|-------------|--------|-------|
| Preparation | Day 2 | Not Started | Dev Team |
| Database Schema Updates | Day 3 | Not Started | Dev Team |
| User Data Migration | Day 4 | Not Started | Dev Team |
| Domain Model Updates | Day 6 | Not Started | Dev Team |
| API Authentication Implementation | Day 8 | Not Started | Dev Team |
| Testing & Validation | Day 10 | Not Started | Dev Team |

**Estimated Effort:** 10 days

---

## Assumptions & Constraints

### Assumptions
1. Laravel 11.x will be used
2. PostgreSQL database will be maintained
3. Clerk API access will be available
4. User data export will be successful
5. Migration can be performed during maintenance window

### Constraints
1. Must maintain data integrity
2. No user experience disruption
3. Performance must match or exceed current system
4. Authentication must be secure
5. Migration must be reversible

---

## Appendix

### Glossary
- **Clerk**: Current authentication provider
- **Laravel Sanctum**: Laravel's API authentication system
- **clerkId**: Current user identifier (string)
- **user_id**: New user identifier (integer)
- **Token**: Sanctum authentication token

### References
- Backend Analysis Report
- Laravel Documentation
- Laravel Sanctum Documentation
- Clerk API Documentation

### Related Documents
- PRD-009-categories-domain.md
- PRD-010-transactions-domain.md
- PRD-011-months-domain.md
- PRD-012-recurring-transactions-domain.md

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-19 | Dev Team | Initial draft |

---

**End of PRD**
