# Product Requirements Document (PRD)
## Currency Domain

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Development Team  
**Status:** Draft

---

## Executive Summary

The Currency domain manages exchange rate data and provides USD to CAD conversion functionality. This domain includes external API integration for real-time exchange rates, caching mechanisms for performance, and staleness handling to ensure accurate conversions.

**Business Value:** Enables accurate currency conversion for international transactions  
**User Impact:** Users benefit from real-time exchange rates and accurate conversions  
**Technical Complexity:** Medium

---

## Background & Context

### Current State (Next.js)
The Currency domain implements sophisticated exchange rate management with 2 use cases, external API integration, caching, and staleness handling. It includes comprehensive error handling and precision management for financial calculations.

### Target State (Laravel)
The domain will be migrated to Laravel while preserving all exchange rate functionality, API integration, caching strategies, and conversion logic. The external API integration and caching mechanisms must be maintained exactly.

### Migration Rationale
This domain provides critical currency conversion capabilities used by Transactions and RecurringTransactions domains. The exchange rate accuracy and caching performance must be preserved to maintain financial accuracy.

---

## Objectives & Success Criteria

### Primary Objectives
1. Preserve exchange rate management with identical functionality
2. Maintain external API integration and caching
3. Keep conversion accuracy and precision
4. Preserve staleness handling and error management
5. Maintain API compatibility for frontend integration

### Success Metrics
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Exchange Rate Accuracy | 100% | 100% | Conversion validation tests |
| API Response Time | <500ms | <500ms | Performance testing |
| Cache Hit Rate | 95% | 95% | Redis monitoring |
| Conversion Precision | 100% | 100% | Precision validation tests |

### Definition of Done
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Exchange rate functionality preserved
- [ ] External API integration working
- [ ] Caching mechanism working
- [ ] Conversion accuracy validated
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Code review approved
- [ ] Deployment successful

---

## User Stories & Use Cases

### User Story 1: Get Exchange Rate
**As a** system  
**I want to** fetch current USD to CAD exchange rates  
**So that** I can provide accurate currency conversions

**Acceptance Criteria:**
- [ ] Fetches rates from external API
- [ ] Caches rates for performance
- [ ] Handles API failures gracefully
- [ ] Checks rate staleness
- [ ] Auto-refreshes expired rates
- [ ] Returns accurate rate data

**Technical Notes:**
- External API integration
- Redis caching for performance
- Staleness detection and refresh

---

### User Story 2: Convert Currency
**As a** system  
**I want to** convert USD amounts to CAD  
**So that** I can process international transactions

**Acceptance Criteria:**
- [ ] Converts USD to CAD accurately
- [ ] Uses real-time exchange rates
- [ ] Handles precision correctly
- [ ] Validates input amounts
- [ ] Returns both CAD and USD amounts
- [ ] Handles conversion errors

**Technical Notes:**
- Decimal precision handling
- Exchange rate validation
- Error handling and logging

---

## Functional Requirements

### FR-1: Exchange Rate Management
**Priority:** Must Have  
**Description:** Fetch, cache, and manage USD to CAD exchange rates

**Acceptance Criteria:**
- Fetch rates from external API
- Cache rates for performance
- Handle API failures gracefully
- Check rate staleness
- Auto-refresh expired rates
- Return accurate rate data

**Dependencies:** External exchange rate API

---

### FR-2: Currency Conversion
**Priority:** Must Have  
**Description:** Convert USD amounts to CAD with precision

**Acceptance Criteria:**
- Convert USD to CAD accurately
- Use real-time exchange rates
- Handle precision correctly
- Validate input amounts
- Return both CAD and USD amounts
- Handle conversion errors

**Dependencies:** Exchange rate data

---

### FR-3: Caching Strategy
**Priority:** Must Have  
**Description:** Redis caching for performance optimization

**Acceptance Criteria:**
- Cache exchange rates
- Invalidate expired rates
- Handle cache misses
- Performance optimization
- Memory management

**Dependencies:** Redis cache

---

### FR-4: Error Handling
**Priority:** Must Have  
**Description:** Comprehensive error handling and logging

**Acceptance Criteria:**
- Handle API failures
- Handle network timeouts
- Handle invalid data
- Log errors appropriately
- Provide fallback mechanisms
- User-friendly error messages

**Dependencies:** Logging system

---

## Non-Functional Requirements

### Performance
- **Response Time:** API responses < 500ms for 95th percentile
- **Throughput:** Handle 1000 requests/second
- **Scalability:** Support 10,000 concurrent users
- **Conversion Performance:** Currency conversions < 100ms

### Security
- **API Security:** Secure external API communication
- **Data Protection:** Exchange rate data protection
- **Input Validation:** Amount validation and sanitization

### Reliability
- **Availability:** 99.9% uptime
- **Error Rate:** < 0.1% error rate
- **Data Integrity:** Exchange rate accuracy
- **Conversion Reliability:** 100% accurate conversions

---

## Domain Model

### Entities
```
ExchangeRate
├── rate: decimal - Exchange rate value
├── lastUpdated: DateTime - Last update timestamp
├── expiresAt: DateTime - Expiration timestamp
├── source: string - Rate source (API provider)
└── isValid: boolean - Rate validity status

Business Rules:
- Rate must be positive
- LastUpdated must be valid timestamp
- ExpiresAt must be after lastUpdated
- Rate must be within reasonable bounds
- Staleness check based on expiration

Validation:
- Rate required, positive decimal
- LastUpdated required, valid timestamp
- ExpiresAt required, valid timestamp
- Source required, string
- Rate bounds validation
```

### Value Objects
```
CurrencyAmount
├── amount: decimal - Amount value
├── currency: string - Currency code (USD/CAD)
├── precision: int - Decimal precision
└── formatted: string - Formatted amount

ConversionResult
├── amountCAD: decimal - CAD amount
├── amountUSD: decimal - USD amount
├── exchangeRate: decimal - Rate used
├── convertedAt: DateTime - Conversion timestamp
└── source: string - Rate source
```

### Aggregates
ExchangeRate is the aggregate root with no child entities.

### Domain Events
- ExchangeRateFetched
- ExchangeRateExpired
- ExchangeRateRefreshed
- CurrencyConverted
- ConversionError

---

## API Specifications

### Endpoint 1: Get Exchange Rate
**Method:** GET  
**Path:** `/api/currency/rate`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "rate": 1.3650,
    "lastUpdated": "2024-12-19T10:00:00Z",
    "expiresAt": "2024-12-19T11:00:00Z",
    "source": "ExchangeRateAPI",
    "isValid": true
  }
}
```

**Business Logic:**
1. Check cache for valid rate
2. If expired or missing, fetch from API
3. Cache new rate with expiration
4. Return rate data

---

### Endpoint 2: Convert Currency
**Method:** POST  
**Path:** `/api/currency/convert`  
**Auth:** Required

**Request:**
```json
{
  "amountUSD": 100.00
}
```

**Validation:**
- `amountUSD`: required, numeric, min: 0

**Response (200):**
```json
{
  "data": {
    "amountCAD": 136.50,
    "amountUSD": 100.00,
    "exchangeRate": 1.3650,
    "convertedAt": "2024-12-19T10:00:00Z",
    "source": "ExchangeRateAPI"
  }
}
```

**Business Logic:**
1. Validate input amount
2. Get current exchange rate
3. Convert USD to CAD
4. Return conversion result

---

## Data Model

### Database Tables

#### exchange_rates
```sql
CREATE TABLE exchange_rates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rate DECIMAL(10,6) NOT NULL,
    last_updated TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    source VARCHAR(100) NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_last_updated (last_updated),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_valid (is_valid)
);
```

**Columns:**
| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| id | BIGINT | NO | AUTO | Primary key |
| rate | DECIMAL(10,6) | NO | - | Exchange rate |
| last_updated | TIMESTAMP | NO | - | Last update time |
| expires_at | TIMESTAMP | NO | - | Expiration time |
| source | VARCHAR(100) | NO | - | Rate source |
| is_valid | BOOLEAN | NO | TRUE | Validity status |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Update time |

**Indexes:**
- `PRIMARY KEY`: id
- `INDEX`: last_updated
- `INDEX`: expires_at
- `INDEX`: is_valid

**Relationships:**
- None

**Constraints:**
- Rate must be positive
- ExpiresAt must be after lastUpdated
- Rate must be within reasonable bounds

---

## Architecture & Design

### Layer Architecture

#### Domain Layer
**Entities:**
- ExchangeRate: Core business entity with validation

**Repository Interfaces:**
- IExchangeRateRepository: Contract for data access

**Domain Services:**
- CurrencyService: Currency conversion logic
- ExchangeRateService: Rate management logic

#### Application Layer
**Use Cases (Actions):**
- GetUsdToCadRate: Fetch current exchange rate
- ConvertUsdToCad: Convert USD to CAD
- RefreshExchangeRate: Refresh expired rates
- ValidateExchangeRate: Check rate validity

**DTOs:**
- ExchangeRateDTO: Data transfer object
- ConversionResultDTO: Conversion result
- CurrencyAmountDTO: Currency amount

#### Infrastructure Layer
**Repository Implementations:**
- ExchangeRateRepository: Eloquent implementation with Redis caching

**External Services:**
- ExchangeRateApiService: External API integration

**Mappers:**
- ExchangeRateMapper: Entity ↔ Database model transformation

#### Interface Layer
**Controllers:**
- CurrencyController: Handles all currency routes

**Middleware:**
- AuthMiddleware: Authentication
- ValidateCurrencyMiddleware: Business rule validation

**Form Requests:**
- ConvertCurrencyRequest: Conversion validation

---

### Design Patterns

**Patterns Used:**
1. **Repository Pattern**: Data access abstraction
2. **Service Layer**: Business logic encapsulation
3. **DTO Pattern**: Data transfer objects
4. **Caching Pattern**: Redis for performance
5. **Strategy Pattern**: Multiple API providers
6. **Circuit Breaker Pattern**: API failure handling

---

### Dependency Injection

**Service Bindings:**
```php
// In AppServiceProvider
$this->app->singleton(IExchangeRateRepository::class, function ($app) {
    return new ExchangeRateRepository(
        $app->make('db'),
        $app->make('redis')
    );
});

$this->app->singleton(ExchangeRateApiService::class, function ($app) {
    return new ExchangeRateApiService(
        $app->make('http'),
        $app->make('config')
    );
});

$this->app->singleton(CurrencyService::class, function ($app) {
    return new CurrencyService(
        $app->make(IExchangeRateRepository::class),
        $app->make(ExchangeRateApiService::class)
    );
});
```

---

## Integration Points

### Dependencies (What this depends on)
1. **External Exchange Rate API**: For real-time exchange rates
2. **Redis Cache**: For performance optimization
3. **Database**: For rate persistence
4. **User Authentication**: For API access

### Dependents (What depends on this)
1. **Transactions Domain**: For USD to CAD conversion
2. **RecurringTransactions Domain**: For currency conversion
3. **Analytics**: For currency reporting

### External Services
1. **Exchange Rate API**: For real-time exchange rates
2. **Redis Cache**: For rate caching
3. **Database**: For rate persistence

---

## Caching Strategy

### Cache Keys
```
exchange_rate:usd_cad:current              # Current USD to CAD rate
exchange_rate:usd_cad:backup               # Backup rate
exchange_rate:usd_cad:last_update          # Last update timestamp
```

### Cache TTL
- Current rate: 1 hour
- Backup rate: 24 hours
- Last update: 1 hour

### Invalidation Rules
**Trigger:** Rate expiration, API refresh  
**Invalidate:**
- `exchange_rate:usd_cad:current`
- `exchange_rate:usd_cad:last_update`

---

## Business Logic & Rules

### Rule 1: Rate Staleness Detection
**Description:** Exchange rates must be checked for staleness and refreshed when expired  
**Triggers:** Rate access operations  
**Implementation:** Compare current time with expiration timestamp  
**Exceptions:** None

### Rule 2: Conversion Precision
**Description:** Currency conversions must maintain financial precision  
**Triggers:** Conversion operations  
**Implementation:** Use Decimal.js for precision, round to 2 decimal places  
**Exceptions:** None

### Rule 3: API Failure Handling
**Description:** Must handle external API failures gracefully  
**Triggers:** API requests  
**Implementation:** Circuit breaker pattern with fallback mechanisms  
**Exceptions:** None

### Rule 4: Rate Validation
**Description:** Exchange rates must be within reasonable bounds  
**Triggers:** Rate fetch operations  
**Implementation:** Validate rate is positive and within expected range  
**Exceptions:** None

---

## Validation Rules

### Entity Validation (Domain Layer)
```php
class ExchangeRate {
    private function validate(): void {
        // Rate validation
        if ($this->rate <= 0) {
            throw new InvalidExchangeRateException('Exchange rate must be positive');
        }
        
        if ($this->rate < 0.5 || $this->rate > 2.0) {
            throw new InvalidExchangeRateException('Exchange rate out of reasonable bounds');
        }
        
        // Timestamp validation
        if (!$this->lastUpdated || $this->lastUpdated > now()) {
            throw new InvalidTimestampException('Invalid last updated timestamp');
        }
        
        if (!$this->expiresAt || $this->expiresAt <= $this->lastUpdated) {
            throw new InvalidTimestampException('Invalid expiration timestamp');
        }
        
        // Source validation
        if (empty($this->source)) {
            throw new InvalidSourceException('Rate source is required');
        }
    }
    
    public function isExpired(): bool {
        return now() > $this->expiresAt;
    }
    
    public function convert(float $amountUSD): float {
        if ($amountUSD < 0) {
            throw new InvalidAmountException('Amount must be positive');
        }
        
        return round($amountUSD * $this->rate, 2);
    }
}
```

### Input Validation (Form Requests)
```php
class ConvertCurrencyRequest extends FormRequest {
    public function rules(): array {
        return [
            'amountUSD' => 'required|numeric|min:0|max:999999.99',
        ];
    }
}
```

---

## Error Handling

### Exception Hierarchy
```
CurrencyException
├── InvalidExchangeRateException
├── InvalidAmountException
├── InvalidTimestampException
├── InvalidSourceException
├── ExchangeRateFetchException
├── StaleExchangeRateException
└── ConversionException
```

### Error Codes
| Code | Exception | HTTP Status | Message |
|------|-----------|-------------|---------|
| INVALID_RATE | InvalidExchangeRateException | 400 | Invalid exchange rate |
| INVALID_AMOUNT | InvalidAmountException | 400 | Invalid amount |
| RATE_FETCH_ERROR | ExchangeRateFetchException | 500 | Failed to fetch exchange rate |
| STALE_RATE | StaleExchangeRateException | 400 | Exchange rate is stale |

### Error Response Format
```json
{
  "error": {
    "message": "Failed to fetch exchange rate",
    "code": "RATE_FETCH_ERROR",
    "details": {
      "source": "ExchangeRateAPI",
      "retryAfter": 300
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
   - [ ] Conversion logic

2. **Use Case Tests**
   - [ ] Happy path scenarios
   - [ ] Error conditions
   - [ ] Boundary conditions
   - [ ] API integration

3. **Repository Tests**
   - [ ] CRUD operations
   - [ ] Query methods
   - [ ] Cache behavior

4. **Service Tests**
   - [ ] Currency conversion
   - [ ] Rate management
   - [ ] API integration
   - [ ] Error handling

### Integration Tests
**Test Cases:**
1. **API Endpoint Tests**
   - [ ] Authentication
   - [ ] Request validation
   - [ ] Response format
   - [ ] Error handling

2. **External API Tests**
   - [ ] API integration
   - [ ] Rate fetching
   - [ ] Error handling
   - [ ] Timeout handling

3. **Cache Tests**
   - [ ] Cache hits
   - [ ] Cache misses
   - [ ] Invalidation
   - [ ] Performance

### Feature Tests
**Test Cases:**
1. **End-to-End Workflow Tests**
   - [ ] Complete currency conversion workflow
   - [ ] Rate refresh workflow
   - [ ] Error handling workflow
   - [ ] Performance workflow

### Performance Tests
**Benchmarks:**
- [ ] API response time < 500ms
- [ ] Currency conversion < 100ms
- [ ] Database query time < 50ms
- [ ] Memory usage < 128MB

---

## Security Considerations

### Authentication
- Laravel Sanctum for API authentication
- User-scoped operations only

### Authorization
- Users can only access currency conversion
- No cross-user data access

### Input Validation
- XSS prevention through input sanitization
- SQL injection prevention through Eloquent ORM
- Amount validation and sanitization

### Data Protection
- Exchange rate data protection
- Input validation and sanitization
- API security

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
5. [ ] Configure external API client

**Deliverables:**
- Database schema
- Basic project structure
- Testing configuration
- API client configuration

**Dependencies:** None

---

### Phase 2: Core Domain Implementation
**Duration:** 2 days  
**Goal:** Implement core domain logic

**Tasks:**
1. [ ] Create ExchangeRate entity
2. [ ] Implement repository interface
3. [ ] Create Eloquent repository
4. [ ] Implement use case services
5. [ ] Add validation rules
6. [ ] Implement conversion logic

**Deliverables:**
- Complete domain layer
- Repository implementation
- Business logic validation
- Conversion logic

**Dependencies:** Phase 1

---

### Phase 3: External API Integration
**Duration:** 2 days  
**Goal:** Implement external API integration

**Tasks:**
1. [ ] Create ExchangeRateApiService
2. [ ] Implement API client
3. [ ] Add error handling
4. [ ] Implement rate fetching
5. [ ] Add circuit breaker pattern
6. [ ] Integration testing

**Deliverables:**
- Complete API integration
- Error handling
- Rate fetching logic
- Circuit breaker implementation

**Dependencies:** Phase 2

---

### Phase 4: API Implementation
**Duration:** 1 day  
**Goal:** Create API endpoints

**Tasks:**
1. [ ] Create CurrencyController
2. [ ] Implement form requests
3. [ ] Add middleware
4. [ ] Configure routes
5. [ ] Add API documentation

**Deliverables:**
- Complete API layer
- Request validation
- Route configuration
- API documentation

**Dependencies:** Phase 3

---

### Phase 5: Testing & Validation
**Duration:** 2 days  
**Goal:** Comprehensive testing

**Tasks:**
1. [ ] Write unit tests
2. [ ] Write integration tests
3. [ ] Performance testing
4. [ ] Security testing
5. [ ] Code review
6. [ ] External API testing

**Deliverables:**
- Test suite
- Performance benchmarks
- Security validation
- External API validation

**Dependencies:** Phase 4

---

## Data Migration

### Source Data
**Current System:** Next.js + Prisma  
**Database:** PostgreSQL  
**Tables:** exchange_rates (if any)

### Transformation Rules
1. **Field mapping**: Direct mapping, no transformation needed
2. **Rate data**: Direct mapping
3. **Timestamp fields**: Direct mapping

### Migration Script
```bash
# Create Laravel migration
php artisan make:migration create_exchange_rates_table
```

### Validation
- [ ] Record count matches
- [ ] Data integrity checks
- [ ] No data loss
- [ ] Rate accuracy preserved

---

## Deployment Plan

### Pre-Deployment
- [ ] Code freeze
- [ ] Final testing in staging
- [ ] Database backup
- [ ] Rollback plan ready
- [ ] External API testing

### Deployment Steps
1. [ ] Deploy Laravel application
2. [ ] Run database migrations
3. [ ] Update API endpoints
4. [ ] Verify external API integration
5. [ ] Test currency conversion

### Post-Deployment
- [ ] Smoke tests
- [ ] Monitor error rates
- [ ] Performance monitoring
- [ ] User acceptance testing
- [ ] External API validation

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| External API failures | Medium | High | Circuit breaker pattern and fallback |
| Rate accuracy issues | Low | High | Comprehensive validation and testing |
| Performance degradation | Low | Medium | Load testing and optimization |
| Data loss during migration | Low | Medium | Comprehensive backups and testing |

---

## Timeline & Milestones

| Milestone | Target Date | Status | Owner |
|-----------|-------------|--------|-------|
| Foundation Setup | Day 1 | Not Started | Dev Team |
| Core Domain Implementation | Day 3 | Not Started | Dev Team |
| External API Integration | Day 5 | Not Started | Dev Team |
| API Implementation | Day 6 | Not Started | Dev Team |
| Testing & Validation | Day 8 | Not Started | Dev Team |

**Estimated Effort:** 8 days

---

## Assumptions & Constraints

### Assumptions
1. Laravel 11.x will be used
2. PostgreSQL database will be maintained
3. Redis caching will be preserved
4. External exchange rate API will be available
5. Currency conversion must be accurate

### Constraints
1. Must maintain API compatibility
2. No data loss during migration
3. Performance must match or exceed current system
4. Currency conversion must be precise
5. External API integration must be reliable

---

## Appendix

### Glossary
- **Exchange Rate**: Current USD to CAD conversion rate
- **Currency Conversion**: Process of converting USD to CAD
- **Rate Staleness**: When exchange rate is expired
- **Precision**: Decimal accuracy for financial calculations

### References
- Backend Analysis Report
- Laravel Documentation
- Domain-Driven Design Principles
- External API Documentation

### Related Documents
- PRD-010-transactions-domain.md
- PRD-012-recurring-transactions-domain.md
- API specification document

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-19 | Dev Team | Initial draft |

---

**End of PRD**
