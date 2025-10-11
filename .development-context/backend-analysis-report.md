# Backend Architecture Analysis Report
## Junction Bank - Domain-Driven Design Implementation

**Generated:** October 11, 2025  
**Purpose:** Pre-platforming analysis for Laravel migration

---

## Executive Summary

This Next.js application implements a **Clean Architecture** with **Domain-Driven Design (DDD)** principles. The backend consists of 5 primary domains managing personal financial operations, with comprehensive CRUD operations, currency conversion, transaction imports, and financial analytics.

**Technology Stack:**
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL via Prisma ORM
- **Caching:** Redis
- **Authentication:** Clerk (to be migrated to Laravel default auth)
- **Architecture:** Clean Architecture with DDD

---

## Architectural Layers

### 1. Domain Layer (Innermost)
**Responsibility:** Core business logic, completely framework-agnostic

**Components:**
- **Entities:** Domain models with validation and business rules
- **Repository Interfaces:** Define data access contracts
- **Exceptions:** Domain-specific error handling
- **Value Objects:** Immutable domain concepts (Money, SpendingByCategory)

### 2. Application Layer
**Responsibility:** Use case orchestration, application-specific logic

**Components:**
- **Actions (Use Cases):** Business operations implementation
- **DTOs:** Data transfer objects for layer communication
- **Services:** Complex orchestration logic

### 3. Infrastructure Layer (Outermost)
**Responsibility:** External system integration, framework-specific implementations

**Components:**
- **Repository Implementations:** Prisma + Redis integration
- **Mappers:** Entity ↔ Database model transformation
- **API Routes:** HTTP endpoint handlers
- **Dependency Injection Container:** Service wiring

---

## Domain Analysis

### Domain 1: Categories

**Purpose:** Organize transactions into income/expense categories

#### Entities
- **Category**
  - Properties: `id`, `name`, `type` (income/expense), `notes`, `isRecurring`, `createdAt`
  - Validation: Name required, type must be 'income' or 'expense'
  - Business Rules: Unique names, cannot delete if has transactions

#### Actions (Use Cases)
1. **IndexCategories** - List all categories
2. **ShowCategory** - Get single category by ID
3. **StoreCategory** - Create new category
   - Validates: Name uniqueness
   - Throws: `CategoryAlreadyExistsException`
4. **DeleteCategory** - Remove category
   - Validates: No associated transactions
   - Throws: `CategoryNotFoundException`, `CategoryHasTransactionsException`

#### Repository Methods
```typescript
interface ICategoryRepository {
  index(): Promise<Category[]>
  show(id: number): Promise<Category | null>
  store(category): Promise<Category>
  destroy(id: number): Promise<void>
  findByName(name: string): Promise<boolean>
  hasTransactions(id: number): Promise<{hasTransactions: boolean, count: number}>
}
```

#### Integration Points
- Used by Transactions for categorization
- Used by RecurringTransactions for pattern categorization
- Referenced in import validation

---

### Domain 2: Transactions

**Purpose:** Manage individual financial transactions (income/expenses)

#### Entities
- **Transaction**
  - Properties: `id`, `clerkId`, `name`, `amountCAD`, `amountUSD`, `categoryId`, `categoryName`, `notes`, `type`, `date`, `monthId`, `createdAt`
  - Enum: `TransactionType` (INCOME, EXPENSE)
  - Validation: Amount must be positive, valid dates
  - Multi-currency: Supports both CAD and USD with automatic conversion

#### Actions (Use Cases)
1. **IndexTransactions** - List transactions (optionally filtered by monthId)
2. **ShowTransaction** - Get single transaction by ID
3. **StoreTransaction** - Create new transaction
   - Converts DTO to domain model via adapter
   - Stores through repository
4. **UpdateTransaction** - Modify existing transaction
   - Uses `cleanUpdateData` utility to eliminate undefined fields
   - Supports partial updates
5. **DeleteTransaction** - Remove transaction
6. **ImportTransactions** - Parse and validate CSV data
   - Validates CSV format and categories
   - Returns valid transactions + errors
   - Does NOT persist (preview only)
7. **PreviewTransactions** - Shows import preview before execution
8. **ProcessTransactionImport** - Executes the actual import
9. **BatchStoreTransactions** - Bulk insert validated transactions

#### Complex Features

##### CSV Import System
**Flow:**
1. User uploads CSV file
2. `TransactionImportService.parseCSV()` processes content
3. Validates each row (date format, amounts, categories, month existence)
4. `ImportTransactions` action returns `{validTransactions, errors}`
5. User reviews preview
6. `ProcessTransactionImport` executes batch store
7. Cache invalidation triggers

**Supported CSV Formats:**
- Headers: Date, Name, AMOUNT CAD, AMOUNT USD, Category Id, Notes, Type
- Date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY
- Amount parsing: Handles currency symbols ($£€), commas, decimals

**Validation Rules:**
- Required: date, name, at least one amount (CAD or USD)
- CategoryId must exist in database
- Creates month if doesn't exist for transaction date
- Type auto-detected from amount sign (negative = expense, positive = income)

##### Currency Handling
- Dual currency support (CAD primary, USD secondary)
- Auto-conversion via `CurrencyService`
- USD → CAD conversion using real-time exchange rates
- CAD amounts never converted to USD (one-way conversion)

#### Repository Methods
```typescript
interface ITransactionRepository {
  index(monthId?: number): Promise<TransactionWithCategory[]>
  show(id: number): Promise<TransactionWithCategory | null>
  store(transaction, prismaTransaction?): Promise<TransactionWithCategory>
  update(id: number, transaction): Promise<TransactionWithCategory>
  destroy(id: number): Promise<void>
  importTransactions(transactions): Promise<TransactionImportResultDTO>
  getTotalSpendingByCategory(monthId): Promise<CategorySpendingDTO[]>
  getUSDSpendingByCategory(monthId): Promise<USDSpending[]>
}
```

#### Caching Strategy
- **Redis caching** on repository layer
- Cache keys: `transactions:${monthId}`, `transaction:${id}`
- Invalidation triggers: Create, update, delete operations
- Fallback to database on cache miss

#### Analytics Features
- Total spending by category (per month)
- USD spending breakdowns
- Transaction counts
- Integration with Months domain for dashboards

---

### Domain 3: Months

**Purpose:** Financial period management and budgeting calculations

#### Entities
- **Month**
  - Properties: `id`, `month` (1-12), `year`, `notes`, `totalIncome`, `totalExpenses`, `recurringExpenses`, `createdAt`
  - Validation: Month 1-12, Year 1900-2100
  - Business Rules: Unique month/year combinations

#### Business Methods (Rich Domain Model)
```typescript
// Financial calculations
getCashflow(): number                    // Income - Expenses
getNonRecurringExpenses(): number        // Total - Recurring
getProjectedDailyBudget(): number        // (Income - Recurring) / Days
getRemainingDailyBudget(): number        // Cashflow / Days Left
getActualDailySpend(): number            // Non-recurring / Days Passed

// Date utilities
getTotalDaysInMonth(): number
getDaysLeftInMonth(): number
getDaysPassedInMonth(): number
isCurrentMonth(): boolean
isInPast(): boolean
isInFuture(): boolean
belongsToDate(date: Date): boolean
getMonthName(): string
```

#### Actions (Use Cases)
1. **IndexMonths** - List all months with pagination
2. **ShowMonth** - Get single month by ID
3. **ShowLatestMonth** - Get most recent month
4. **FindMonthByDate** - Find month for specific date
5. **StoreMonth** - Create new month
   - Validates: No duplicate month/year
   - Optionally applies recurring transactions on creation
   - Throws: `MonthAlreadyExistsException`
6. **UpdateMonth** - Modify existing month
   - Validates: No conflicting month/year if changed
7. **DestroyMonth** - Delete month (validates no transactions exist)
8. **RecalculateRecurringExpenses** - Recalculate recurring totals
   - Updates `recurringExpenses` field
   - Triggered after recurring transaction changes
9. **GetMonthlySpendingByCategory** - Analytics aggregation
   - Combines CAD and USD spending
   - Formats currency values
   - Sorts by total amount descending

#### Repository Methods
```typescript
interface IMonthRepository {
  index(options?: {year?, page?, limit?}): Promise<{data, pagination}>
  show(id: number): Promise<Month | null>
  findByDate(month, year): Promise<Month | null>
  findLatest(): Promise<Month | null>
  store(month): Promise<Month>
  update(id, data): Promise<Month>
  destroy(id): Promise<void>
  findByMonthAndYear(month, year): Promise<boolean>
  hasTransactions(id): Promise<{hasTransactions, count}>
  recalculateRecurringExpenses(monthId?): Promise<void>
}
```

#### Integration Points
- **With Transactions:** Auto-creates month during transaction import
- **With RecurringTransactions:** Applies recurring patterns to new months
- **Dashboard:** Primary data source for financial dashboards

---

### Domain 4: RecurringTransactions

**Purpose:** Manage predictable recurring expenses/income (subscriptions, bills, salary)

#### Entities
- **RecurringTransaction**
  - Properties: `id`, `clerkId`, `name`, `amountCAD`, `amountUSD`, `categoryId`, `notes`, `dayOfMonth`, `type`, `createdAt`
  - Validation: Amount > 0, dayOfMonth 1-31
  - Business Rules: Unique names, both currencies supported

#### Actions (Use Cases)
1. **IndexRecurringTransactions** - List all recurring transactions
2. **ShowRecurringTransaction** - Get single recurring transaction
3. **StoreRecurringTransaction** - Create new recurring pattern
   - Uses `CurrencyService` for USD→CAD conversion
   - Validates transaction type
4. **UpdateRecurringTransaction** - Modify existing pattern
   - Validates: Name uniqueness if changed
   - Handles currency conversion updates
   - Throws: `RecurringTransactionNotFoundException`, `RecurringTransactionAlreadyExistsException`
5. **DeleteRecurringTransaction** - Remove recurring pattern

#### Repository Methods
```typescript
interface IRecurringTransactionRepository {
  index(): Promise<{data, pagination}>
  show(id: number): Promise<RecurringTransaction | null>
  store(recurringTransaction): Promise<RecurringTransaction>
  update(id, data): Promise<RecurringTransaction>
  destroy(id): Promise<void>
  findByName(name: string): Promise<boolean>
  applyToMonth(monthId, month, year): Promise<number>  // Returns count created
}
```

#### Key Feature: Month Application System

**Flow:**
1. New month is created (via `StoreMonth` action)
2. `applyToMonth()` is called with month details
3. Repository queries all recurring transactions
4. Creates regular transactions for each recurring pattern
5. Sets transaction date based on `dayOfMonth` and month/year
6. Updates month totals (`recurringExpenses`)
7. Increments transaction count

**Business Rules:**
- Applied automatically when month created
- Date set to `dayOfMonth` or last day of month if dayOfMonth > days in month
- Preserves all metadata (category, notes, type)
- Both CAD and USD amounts transferred

---

### Domain 5: Currency

**Purpose:** Exchange rate management and currency conversion

#### Entities
- **ExchangeRate** (Value Object)
  - Properties: `rate`, `lastUpdated`, `expiresAt`
  - Methods: `convert(amount)`, `isExpired()`
  - Validation: Rate must be positive, timestamps required

#### Actions (Use Cases)
1. **GetUsdToCadRate** - Fetch current USD→CAD rate
   - Uses external API service
   - Checks rate staleness
   - Auto-refreshes if expired
   - Throws: `ExchangeRateFetchException`, `StaleExchangeRateException`
2. **ConvertUsdToCad** - Convert USD amount to CAD
   - Validates: Amount must be positive number
   - Uses Decimal.js for precision
   - Rounds to 2 decimal places
   - Throws: `InvalidAmountException`

#### Service Layer
- **CurrencyService** - Orchestrates currency operations
  - Method: `processCurrencyAmounts(amountCAD, amountUSD)`
  - Logic:
    - If both provided: Return as-is
    - If only CAD: Return CAD (no USD conversion)
    - If only USD: Convert to CAD, return both
    - Throws: `InvalidAmountException` if neither provided

#### External Integration
- **ExchangeRateApiService**
  - Fetches rates from external API
  - Implements caching (likely Redis)
  - Provides `clearCache()` method for rate refresh

#### Integration Points
- Used by `StoreRecurringTransaction` during creation
- Used by `UpdateRecurringTransaction` during updates
- Used by `TransactionImportService` for CSV imports with USD amounts

---

## Cross-Cutting Concerns

### Authentication & Authorization
**Current:** Clerk-based authentication
- User identifier: `clerkId` (string)
- Passed via header: `x-user-id`
- All transactions, recurring transactions scoped to user

**Migration Target:** Laravel default authentication
- Will need to replace `clerkId` with Laravel's user ID system
- Implement middleware for authentication
- Update all references from `clerkId` to `userId`

### Error Handling

#### Domain Exceptions Hierarchy
```
DomainException (base)
├── CategoryException
│   ├── CategoryAlreadyExistsException
│   ├── CategoryNotFoundException
│   ├── CategoryHasTransactionsException
│   ├── InvalidCategoryTypeException
│   └── CategoryNameEmptyException
├── TransactionException
├── RecurringTransactionException
│   ├── RecurringTransactionNotFoundException
│   └── RecurringTransactionAlreadyExistsException
├── MonthException
│   ├── MonthNotFoundException
│   ├── MonthAlreadyExistsException
│   ├── InvalidMonthNumberException
│   └── InvalidYearException
└── CurrencyException
    ├── InvalidAmountException
    ├── ExchangeRateFetchException
    └── StaleExchangeRateException
```

#### API Error Handler
- Centralized error handling: `ApiErrorHandler`
- Methods: `handle()`, `validationError()`
- Returns consistent JSON error responses

### Data Consistency

#### Update Pattern (Refactored)
**Utility:** `cleanUpdateData(data, transformers)`
- Filters out `undefined` values automatically
- Applies custom transformers for complex mappings
- Used across Transactions and RecurringTransactions
- Eliminates repetitive conditional checks

**Example:**
```typescript
const updateData = cleanUpdateData(data, {
  type: (value) => value as TransactionType,
  categoryId: (value) => ({ connect: { id: value } })
});
```

#### Caching Strategy
- **Cache Layer:** Redis
- **Invalidation:** Automatic on CUD operations
- **Keys:** Domain-specific (e.g., `transactions:${monthId}`)
- **Repositories with caching:**
  - CategoryRepository
  - MonthRepository
  - TransactionRepository
- **No caching:** RecurringTransactionRepository

### Dependency Injection

**Container:** `/infrastructure/container.ts`

**Singleton Repositories:**
```typescript
categoryRepository: ICategoryRepository
monthRepository: IMonthRepository
transactionRepository: ITransactionRepository
recurringTransactionRepository: IRecurringTransactionRepository
exchangeRateService: IExchangeRateApiService
```

**Factory Functions:**
```typescript
makeCategoryActions()
makeCurrencyActions()
makeMonthActions()
makeRecurringTransactionActions()
makeTransactionActions()
```

**Pattern:** Repository singletons → Action factories → API routes

---

## Database Schema

### Core Models

#### Category
```prisma
model Category {
  id                    Int       @id @default(autoincrement())
  name                  String    @unique
  type                  String    // 'income' | 'expense'
  notes                 String?
  isRecurring           Boolean   @default(false)
  createdAt             DateTime  @default(now())
  recurringTransactions RecurringTransaction[]
  transactions          Transaction[]
}
```

#### Month
```prisma
model Month {
  id                Int       @id @default(autoincrement())
  month             Int       // 1-12
  year              Int
  notes             String?
  totalExpenses     Decimal   @default(0) @db.Decimal(10,2)
  totalIncome       Decimal   @default(0) @db.Decimal(10,2)
  transactionCount  Int       @default(0)
  recurringExpenses Decimal   @default(0) @db.Decimal(10,2)
  createdAt         DateTime  @default(now())
  transactions      Transaction[]
  
  @@unique([month, year])
}
```

#### Transaction
```prisma
model Transaction {
  id         Int             @id @default(autoincrement())
  clerkId    String          // USER IDENTIFIER
  monthId    Int
  name       String
  amountCAD  Decimal         @db.Decimal(10,2)
  amountUSD  Decimal?        @db.Decimal(10,2)
  categoryId Int
  notes      String?
  date       DateTime        @db.Date
  type       TransactionType @default(Expense)
  createdAt  DateTime        @default(now())
  category   Category        @relation(fields: [categoryId], references: [id])
  month      Month           @relation(fields: [monthId], references: [id])
}
```

#### RecurringTransaction
```prisma
model RecurringTransaction {
  id         Int             @id @default(autoincrement())
  clerkId    String          // USER IDENTIFIER
  name       String
  amountCAD  Decimal         @db.Decimal(10,2)
  amountUSD  Decimal?        @db.Decimal(10,2)
  categoryId Int
  notes      String?
  dayOfMonth Int?            // 1-31
  type       TransactionType @default(Expense)
  createdAt  DateTime        @default(now())
  category   Category        @relation(fields: [categoryId], references: [id])
}
```

#### Indexes
- Categories: `name`
- Months: `month, year` (composite unique)
- Transactions: `clerkId`, `monthId`, `categoryId`
- RecurringTransactions: `clerkId`, `categoryId`

---

## API Endpoints (Current Next.js Implementation)

### Categories
- `GET /api/categories` → IndexCategories
- `POST /api/categories` → StoreCategory
- `GET /api/categories/[id]` → ShowCategory
- `PUT /api/categories/[id]` → UpdateCategory (not shown but implied)
- `DELETE /api/categories/[id]` → DeleteCategory

### Transactions
- `GET /api/transactions?monthId=X` → IndexTransactions
- `POST /api/transactions` → StoreTransaction
- `GET /api/transactions/[id]` → ShowTransaction
- `PUT /api/transactions/[id]` → UpdateTransaction
- `DELETE /api/transactions/[id]` → DeleteTransaction
- `POST /api/transactions/import` → ProcessTransactionImport
- `POST /api/transactions/preview` → PreviewTransactions

### Months
- `GET /api/months` → IndexMonths
- `POST /api/months` → StoreMonth
- `GET /api/months/[id]` → ShowMonth
- `GET /api/months/latest` → ShowLatestMonth
- `PUT /api/months/[id]` → UpdateMonth
- `DELETE /api/months/[id]` → DestroyMonth
- `POST /api/months/recalculate` → RecalculateRecurringExpenses
- `GET /api/months/[id]/spending` → GetMonthlySpendingByCategory

### RecurringTransactions
- `GET /api/recurring-transactions` → IndexRecurringTransactions
- `POST /api/recurring-transactions` → StoreRecurringTransaction
- `GET /api/recurring-transactions/[id]` → ShowRecurringTransaction
- `PUT /api/recurring-transactions/[id]` → UpdateRecurringTransaction
- `DELETE /api/recurring-transactions/[id]` → DeleteRecurringTransaction

---

## Testing Coverage

### Categories Domain
- 4 actions with comprehensive test suites
- Entity validation tests
- Repository integration tests
- Mapper tests

### Transactions Domain
- **47 tests** across all components
- Entity, actions, adapters, validators tested
- Import service extensively tested
- Repository operations validated

### Months Domain
- Complete action coverage
- Entity business method tests
- Repository integration tests
- Date calculation validation

### RecurringTransactions Domain
- **37 tests** covering major functionality
- Month application logic tested
- Currency conversion integration
- Repository operations validated

### Currency Domain
- Exchange rate entity tests
- Conversion action tests
- API service mocking
- Error handling validation

**Total Test Coverage:** Comprehensive across all domains

---

## Key Business Workflows

### 1. Transaction Import Workflow
```
User uploads CSV
  ↓
TransactionImportService.parseCSV()
  ↓
For each row:
  - Parse date, amounts, category
  - Validate format and business rules
  - Find or create Month
  - Add to validTransactions or errors array
  ↓
PreviewTransactions (show user results)
  ↓
User confirms
  ↓
ProcessTransactionImport
  ↓
BatchStoreTransactions
  ↓
Cache invalidation
  ↓
Return import summary
```

### 2. New Month Creation Workflow
```
User creates Month
  ↓
StoreMonth action validates uniqueness
  ↓
Month entity created
  ↓
Repository persists Month
  ↓
applyRecurringTransactions callback (optional)
  ↓
RecurringTransactionRepository.applyToMonth()
  ↓
Create Transaction for each RecurringTransaction
  ↓
Update Month totals (recurringExpenses)
  ↓
Cache invalidation
  ↓
Return created Month
```

### 3. Currency Conversion Workflow
```
Transaction has USD amount
  ↓
CurrencyService.processCurrencyAmounts()
  ↓
GetUsdToCadRate.execute()
  ↓
Check if rate expired
  ↓
If expired: Refresh from API
  ↓
ConvertUsdToCad.execute()
  ↓
Return {amountCAD, amountUSD}
  ↓
Store both values in Transaction
```

### 4. Category Spending Analysis Workflow
```
Dashboard requests month spending
  ↓
GetMonthlySpendingByCategory.execute(monthId)
  ↓
Promise.all([
  getTotalSpendingByCategory(monthId),
  getUSDSpendingByCategory(monthId)
])
  ↓
Merge CAD and USD spending per category
  ↓
Format currency values
  ↓
Sort by total descending
  ↓
Return formatted spending data
```

---

## Migration Recommendations for Laravel

### 1. Domain Preservation
**Recommendation:** Preserve all domain logic verbatim

The domain layer (entities, exceptions, interfaces) is framework-agnostic and should be reused with minimal changes:
- Port TypeScript entities to PHP classes
- Maintain validation logic in entities
- Keep repository interfaces as contracts
- Preserve exception hierarchy

### 2. Repository Implementation
**Current:** Prisma ORM + Redis
**Target:** Laravel Eloquent + Redis

**Migration Strategy:**
- Convert Prisma models to Eloquent models
- Implement repository interfaces with Eloquent
- Maintain Redis caching layer
- Keep cache invalidation logic identical

### 3. Use Cases (Actions)
**Current:** Standalone TypeScript classes
**Target:** Laravel Service classes or Actions (Artisan Actions pattern)

**Options:**
1. **Service Classes:** `app/Services/Categories/IndexCategoriesService.php`
2. **Action Classes:** `app/Actions/Categories/IndexCategories.php`
3. **CQRS Pattern:** Separate Commands and Queries

**Recommendation:** Service classes for consistency with Laravel conventions

### 4. API Layer
**Current:** Next.js API routes
**Target:** Laravel Controllers

**Pattern:**
```php
class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $monthId = $request->query('monthId');
        $transactions = $this->indexTransactionsService->execute($monthId);
        return response()->json(TransactionResource::collection($transactions));
    }
}
```

### 5. Authentication Migration
**Critical Change:** Clerk → Laravel Auth

**Steps:**
1. Replace `clerkId` with Laravel's user ID (`user_id`)
2. Implement Laravel Sanctum for API authentication
3. Add authentication middleware to routes
4. Update database schema: Rename `clerk_id` → `user_id`
5. Update all domain models and DTOs

**Schema Changes:**
```sql
ALTER TABLE transactions RENAME COLUMN clerk_id TO user_id;
ALTER TABLE recurring_transactions RENAME COLUMN clerk_id TO user_id;
```

### 6. Dependency Injection
**Current:** Custom container with factory functions
**Target:** Laravel Service Container

**Laravel Approach:**
```php
// In AppServiceProvider
$this->app->singleton(ICategoryRepository::class, function ($app) {
    return new CategoryRepository(
        $app->make('db'), 
        $app->make('redis')
    );
});

// In Controller
public function __construct(
    private IndexCategoriesService $indexCategories
) {}
```

### 7. Validation
**Current:** Entity-level validation + DTO validation
**Target:** Laravel Form Requests + Entity validation

**Recommendation:**
- Use Form Requests for HTTP input validation
- Preserve entity validation logic for business rules
- Create custom validation rules for complex scenarios

### 8. Testing Strategy
**Current:** Vitest with comprehensive domain tests
**Target:** PHPUnit with Feature + Unit tests

**Preservation:**
- Port all domain unit tests to PHPUnit
- Add Laravel Feature tests for API endpoints
- Maintain test-driven development approach
- Aim for equivalent or better coverage

### 9. Transaction Import System
**Critical Feature:** CSV upload and processing

**Laravel Implementation:**
```php
class TransactionImportService
{
    public function parseCSV(UploadedFile $file, User $user): array
    {
        // Use League CSV or custom parser
        // Maintain identical validation logic
        // Return ['validTransactions' => [...], 'errors' => [...]]
    }
}
```

**Recommendations:**
- Use `league/csv` package for parsing
- Maintain preview → confirm → import flow
- Queue large imports with Laravel Jobs
- Preserve all validation rules

### 10. Caching Strategy
**Preserve Redis caching exactly as implemented**

Laravel implementation:
```php
public function index(int $monthId): Collection
{
    return Cache::remember(
        "transactions:{$monthId}", 
        3600, 
        fn() => $this->repository->findByMonth($monthId)
    );
}

public function store(Transaction $transaction): void
{
    $this->repository->save($transaction);
    Cache::forget("transactions:{$transaction->month_id}");
}
```

---

## Data Migration Considerations

### Schema Changes Required
1. **Authentication:**
   - Rename `clerk_id` → `user_id` (transactions, recurring_transactions)
   - Add Laravel's `users` table with auth fields
   
2. **Timestamps:**
   - Ensure `created_at`, `updated_at` columns exist
   - Add `updated_at` where missing (categories, months)

3. **Indexes:**
   - Update indexes referencing `clerk_id` → `user_id`
   - Review performance after migration

### Data Transformation
- Export existing users from Clerk
- Create corresponding Laravel users
- Map `clerk_id` to new `user_id`
- Update all foreign key references

---

## Front-End Reusability

**Current React Components (Reusable):**
- `/components/ui/*` - ShadCN components (fully reusable)
- `/components/layout/*` - DataTable, Modal, ResourceDrawer
- `/components/transactions/*` - CSV upload, import flow
- `/app/dashboard/*` - All dashboard pages

**Integration Strategy:**
1. Keep Next.js frontend initially
2. Point API calls to Laravel backend (proxy or direct)
3. Update API client: `/infrastructure/api-client.ts`
4. Replace authentication: Clerk hooks → Laravel Sanctum
5. Test each domain endpoint after migration

**Long-term Options:**
- Keep Next.js as separate frontend
- Gradually migrate to Laravel Blade + Inertia.js
- Use Laravel as pure API with Next.js SPA

---

## Recommended Migration Order

### Phase 1: Foundation (Week 1-2)
1. Set up Laravel project with Docker, PostgreSQL, Redis
2. Create database schema (Eloquent migrations)
3. Implement authentication (Laravel Sanctum)
4. Set up testing framework

### Phase 2: Core Domains (Week 3-4)
1. **Categories domain** (simplest, no dependencies)
   - Entities, services, repository
   - API endpoints
   - Tests
2. **Currency domain** (used by other domains)
   - Exchange rate integration
   - Conversion service
   - Tests

### Phase 3: Primary Domains (Week 5-7)
1. **Months domain**
   - Entity with business methods
   - CRUD operations
   - Analytics endpoints
2. **Transactions domain**
   - Core CRUD operations
   - CSV import system
   - Caching implementation
   - Analytics integration

### Phase 4: Advanced Features (Week 8-9)
1. **RecurringTransactions domain**
   - Month application logic
   - Integration with Months
2. **Frontend integration**
   - Update API client
   - Authentication flow
   - End-to-end testing

### Phase 5: Polish & Deploy (Week 10)
1. Performance optimization
2. Complete test coverage
3. Documentation
4. Deployment setup

---

## Risk Assessment

### High Risk
1. **CSV Import Logic Complexity**
   - Contains intricate parsing and validation
   - Recommendation: Port carefully with extensive testing

2. **Currency Conversion Integration**
   - External API dependency
   - Recommendation: Implement with identical error handling

3. **Month Application (Recurring Transactions)**
   - Complex business logic with multiple side effects
   - Recommendation: Port with comprehensive integration tests

### Medium Risk
1. **Caching Strategy**
   - Redis invalidation must be identical
   - Recommendation: Document all cache keys and invalidation points

2. **Authentication Migration**
   - Clerk → Laravel affects all domains
   - Recommendation: Implement feature flag for gradual rollout

### Low Risk
1. **Basic CRUD Operations**
   - Straightforward translation to Eloquent
2. **Entity Validation**
   - Direct port to PHP classes
3. **API Structure**
   - Maps cleanly to Laravel resource controllers

---

## Performance Considerations

### Current Optimizations
1. **Redis caching** on frequently accessed data
2. **Database indexes** on foreign keys and query fields
3. **Batch operations** for transaction imports
4. **Eager loading** (Prisma includes)

### Laravel Equivalents
1. **Cache facade** with Redis driver
2. **Eloquent indexes** in migrations
3. **Batch inserts** with Eloquent or Query Builder
4. **Eager loading** with `with()` method

### Additional Laravel Optimizations
1. **Query caching** for expensive aggregations
2. **Job queues** for CSV imports (large files)
3. **Database transactions** for consistency
4. **Response caching** for public endpoints

---

## Conclusion

This application demonstrates a well-architected DDD implementation with clean separation of concerns. The domain logic is framework-agnostic and highly portable to Laravel.

**Key Strengths:**
- Comprehensive test coverage
- Clear domain boundaries
- Rich domain models with business logic
- Consistent use of repository pattern
- Effective caching strategy

**Migration Complexity:** Medium
- Domain logic: Low complexity (direct port)
- Repository layer: Medium complexity (Prisma → Eloquent)
- Authentication: Medium complexity (Clerk → Laravel)
- Import system: High complexity (preserve carefully)

**Estimated Timeline:** 8-10 weeks for full migration with testing

**Success Factors:**
1. Preserve domain logic integrity
2. Maintain test coverage throughout migration
3. Implement authentication migration carefully
4. Test CSV import extensively
5. Validate caching behavior matches current system
6. Use TDD approach per user preference [[memory:5875342]]

---

## Appendix A: Domain Action Summary

### Categories (4 actions)
- IndexCategories
- ShowCategory
- StoreCategory
- DeleteCategory

### Currency (2 actions)
- GetUsdToCadRate
- ConvertUsdToCad

### Months (10 actions)
- IndexMonths
- ShowMonth
- ShowLatestMonth
- FindMonthByDate
- StoreMonth
- UpdateMonth
- DestroyMonth
- RecalculateRecurringExpenses
- GetMonthlySpendingByCategory

### RecurringTransactions (5 actions)
- IndexRecurringTransactions
- ShowRecurringTransaction
- StoreRecurringTransaction
- UpdateRecurringTransaction
- DeleteRecurringTransaction

### Transactions (9 actions)
- IndexTransactions
- ShowTransaction
- StoreTransaction
- UpdateTransaction
- DeleteTransaction
- ImportTransactions
- PreviewTransactions
- ProcessTransactionImport
- BatchStoreTransactions

**Total Actions:** 30 distinct use cases

---

## Appendix B: Database Relationships

```
User (to be added)
  ↓ has many
Transactions
  ↓ belongs to
Category
Month

User
  ↓ has many
RecurringTransactions
  ↓ belongs to
Category

Month
  ↓ has many
Transactions

Category
  ↓ has many
Transactions
  ↓ has many
RecurringTransactions
```

---

**End of Report**

