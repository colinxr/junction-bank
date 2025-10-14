# Development Best Practices

## Code Organization

### Domain-Driven Design Structure

**Organize by domain, not by layer:**

```
✓ Good
app/Domains/Categories/
├── Actions/
├── DTOs/
├── Models/
└── Repositories/

✗ Bad
app/
├── Actions/
│   ├── CategoryAction.php
│   ├── TransactionAction.php
├── Models/
│   ├── Category.php
│   ├── Transaction.php
```

**Keep domains isolated:**

```php
// ✓ Good - Use DTOs for cross-domain communication
class CreateTransactionAction
{
    public function execute(TransactionData $data, int $categoryId): Transaction
    {
        $category = $this->categoryRepository->find($categoryId);
        // Use category data, not the model directly
    }
}

// ✗ Bad - Direct model dependency across domains
use App\Domains\Categories\Models\Category;
class CreateTransactionAction
{
    public function execute(TransactionData $data, Category $category): Transaction
```

### File Size Guidelines

**Keep files focused and small:**

-   Controllers: < 100 lines
-   Actions: < 150 lines
-   Models: < 200 lines
-   DTOs: < 100 lines

**When to split:**

-   Single file > 300 lines → Extract concerns
-   Class > 10 methods → Split responsibilities
-   Method > 50 lines → Extract helper methods

### Naming Conventions

**Actions:**

```php
// ✓ Good - Verb + Noun
CreateCategoryAction
UpdateTransactionAction
DeleteRecurringTransactionAction

// ✗ Bad
CategoryAction
DoTransaction
Handler
```

**DTOs:**

```php
// ✓ Good - Noun + Data suffix
CategoryData
TransactionFilterData
ImportPreviewData

// ✗ Bad
Category
TransactionDTO
TData
```

**Repositories:**

```php
// ✓ Good - Interface + Implementation
CategoryRepository (interface)
EloquentCategoryRepository (implementation)

// ✗ Bad
CategoryRepo
Categories
CategoryDatabase
```

## Code Quality

### Type Safety

**Always use strict types:**

```php
<?php

declare(strict_types=1);

namespace App\Domains\Categories\Actions;

// ✓ Good - All types declared
final class CreateCategoryAction
{
    public function __construct(
        private readonly CategoryRepository $repository
    ) {}

    public function execute(CategoryData $data): Category
    {
        return $this->repository->create($data);
    }
}

// ✗ Bad - Missing types
class CreateCategoryAction
{
    public function __construct($repository) {}

    public function execute($data)
    {
        return $this->repository->create($data);
    }
}
```

**Use readonly properties:**

```php
// ✓ Good - Immutable DTOs
final readonly class CategoryData
{
    public function __construct(
        public string $name,
        public string $type,
        public ?string $notes = null
    ) {}
}

// ✗ Bad - Mutable
class CategoryData
{
    public string $name;
    public string $type;
}
```

### Error Handling

**Use specific exceptions:**

```php
// ✓ Good - Domain-specific exceptions
class CategoryNotFoundException extends DomainException
{
    public static function forId(int $id): self
    {
        return new self("Category with ID {$id} not found");
    }
}

// Usage
if (!$category) {
    throw CategoryNotFoundException::forId($id);
}

// ✗ Bad - Generic exceptions
if (!$category) {
    throw new Exception("Not found");
}
```

**Handle errors at appropriate layer:**

```php
// ✓ Good - Controller handles HTTP concerns
public function store(CreateCategoryRequest $request): JsonResponse
{
    try {
        $category = $this->action->execute(
            CategoryData::fromRequest($request)
        );
        return response()->json($category, 201);
    } catch (DomainException $e) {
        return response()->json(['error' => $e->getMessage()], 400);
    }
}

// ✗ Bad - Action handles HTTP concerns
public function execute(CategoryData $data): JsonResponse
{
    try {
        $category = $this->repository->create($data);
        return response()->json($category, 201);
    } catch (Exception $e) {
        return response()->json(['error' => 'Failed'], 500);
    }
}
```

### Validation

**Use Form Requests:**

```php
// ✓ Good - Dedicated validation
class CreateCategoryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:categories'],
            'type' => ['required', 'in:income,expense'],
            'notes' => ['nullable', 'string'],
        ];
    }
}

// ✗ Bad - Validation in controller
public function store(Request $request): JsonResponse
{
    $request->validate([
        'name' => 'required|string|max:255|unique:categories',
        // ...
    ]);
}
```

## Database Best Practices

### Migrations

**Keep migrations atomic:**

```php
// ✓ Good - Single concern
public function up(): void
{
    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->enum('type', ['income', 'expense']);
        $table->timestamps();
    });
}

// ✗ Bad - Multiple unrelated changes
public function up(): void
{
    Schema::create('categories', function (Blueprint $table) { ... });
    Schema::create('transactions', function (Blueprint $table) { ... });
    DB::table('settings')->insert(['key' => 'foo']);
}
```

**Always provide rollback:**

```php
// ✓ Good - Reversible
public function down(): void
{
    Schema::dropIfExists('categories');
}

// ✗ Bad - No rollback
public function down(): void
{
    //
}
```

### Query Optimization

**Eager load relationships:**

```php
// ✓ Good - Avoids N+1
$transactions = Transaction::with('category')->get();

// ✗ Bad - N+1 query problem
$transactions = Transaction::all();
foreach ($transactions as $transaction) {
    echo $transaction->category->name; // N queries
}
```

**Use specific selects:**

```php
// ✓ Good - Only needed columns
Category::select(['id', 'name', 'type'])->get();

// ✗ Bad - Fetching unnecessary data
Category::all(); // SELECT *
```

**Index foreign keys:**

```php
// ✓ Good - Indexed for performance
$table->foreignId('category_id')
    ->constrained()
    ->onDelete('cascade');

// Composite index for common queries
$table->index(['user_id', 'created_at']);
```

## Testing Best Practices

### Test Organization

**Organize tests by domain:**

```
tests/
├── Unit/
│   └── Domains/
│       ├── Categories/
│       │   ├── Actions/
│       │   │   └── CreateCategoryActionTest.php
│       │   └── DTOs/
│       └── Transactions/
└── Feature/
    └── Http/
        └── Controllers/
            └── CategoryControllerTest.php
```

### Test Naming

**Use descriptive test names:**

```php
// ✓ Good - Clear intent
it('creates a category with valid data', function () { ... });
it('throws exception when category name is duplicate', function () { ... });
it('returns 404 when category not found', function () { ... });

// ✗ Bad - Unclear
it('test create', function () { ... });
it('works', function () { ... });
```

### Test Structure

**Follow Arrange-Act-Assert:**

```php
it('creates a category with valid data', function () {
    // Arrange
    $data = CategoryData::from([
        'name' => 'Groceries',
        'type' => 'expense',
    ]);
    $action = new CreateCategoryAction(new EloquentCategoryRepository());

    // Act
    $category = $action->execute($data);

    // Assert
    expect($category)->toBeInstanceOf(Category::class);
    expect($category->name)->toBe('Groceries');
    expect($category->type)->toBe('expense');
});
```

### Test Coverage

**Focus on critical paths:**

```php
// ✓ Must test
- Business logic in Actions
- Domain rules and validation
- Repository implementations
- Critical user flows

// ✓ Should test
- Controllers (integration)
- Form requests
- DTOs
- Policies

// ✓ Can skip
- Simple getters/setters
- Framework code
- Third-party packages
```

## Performance Guidelines

### Caching Strategy

**Cache expensive operations:**

```php
// ✓ Good - Cache database queries
public function findAll(): Collection
{
    return Cache::remember(
        'categories.all',
        now()->addHour(),
        fn () => Category::all()
    );
}

// Invalidate on changes
public function create(CategoryData $data): Category
{
    $category = Category::create([...]);
    Cache::forget('categories.all');
    return $category;
}
```

**Use cache tags for granular invalidation:**

```php
// ✓ Good - Tagged caches
Cache::tags(['categories', "user:{$userId}"])
    ->remember($key, $ttl, $callback);

// Invalidate specific tags
Cache::tags(['categories'])->flush();
```

### Queue Background Jobs

**Queue expensive operations:**

```php
// ✓ Good - Asynchronous
public function import(array $transactions): void
{
    ProcessTransactionImportJob::dispatch($transactions);
}

// ✗ Bad - Synchronous
public function import(array $transactions): void
{
    foreach ($transactions as $transaction) {
        $this->createTransaction($transaction); // Slow
    }
}
```

### Batch Operations

**Use batch inserts:**

```php
// ✓ Good - Single query
DB::table('transactions')->insert($data);

// ✗ Bad - Multiple queries
foreach ($data as $row) {
    DB::table('transactions')->insert($row);
}
```

## Security Best Practices

### Input Validation

**Always validate and sanitize:**

```php
// ✓ Good - Validated via Form Request
public function store(CreateCategoryRequest $request): JsonResponse
{
    $data = CategoryData::fromRequest($request); // Already validated
}

// ✗ Bad - Direct from request
public function store(Request $request): JsonResponse
{
    Category::create($request->all()); // Dangerous!
}
```

### Authorization

**Use Policies consistently:**

```php
// ✓ Good - Policy check
public function update(Category $category, UpdateCategoryRequest $request): JsonResponse
{
    $this->authorize('update', $category);
    // ...
}

// ✗ Bad - Manual checks
public function update(Category $category, UpdateCategoryRequest $request): JsonResponse
{
    if ($category->user_id !== auth()->id()) {
        abort(403);
    }
}
```

### SQL Injection Prevention

**Use parameter binding:**

```php
// ✓ Good - Parameterized query
DB::table('categories')
    ->where('name', $name)
    ->get();

// ✗ Bad - String concatenation
DB::select("SELECT * FROM categories WHERE name = '{$name}'");
```

### XSS Prevention

**Escape output (Blade does this automatically):**

```php
// ✓ Good - Escaped
{{ $category->name }}

// ✗ Bad - Unescaped
{!! $category->name !!}
```

## Git Workflow

### Commit Messages

**Write clear commit messages:**

```bash
# ✓ Good
feat(categories): add bulk category import
fix(transactions): resolve date parsing error
refactor(auth): extract token validation logic
test(categories): add repository unit tests

# ✗ Bad
update
fix bug
wip
changes
```

### Branch Management

**Use descriptive branch names:**

```bash
# ✓ Good
feature/TICKET-123-add-bulk-import
bugfix/TICKET-456-fix-date-parsing
refactor/TICKET-789-extract-validation

# ✗ Bad
new-feature
fix
updates
my-branch
```

### Pull Requests

**Before creating PR:**

```bash
# Run quality checks
just quality

# Run tests
just test

# Check for uncommitted changes
git status

# Rebase on main
git fetch origin main
git rebase origin/main
```

## Code Review Guidelines

### As Reviewer

**Focus on:**

-   Architecture and design
-   Business logic correctness
-   Security concerns
-   Performance implications
-   Test coverage
-   Code readability

**Don't focus on:**

-   Personal style preferences (use Pint)
-   Subjective opinions
-   Premature optimization

**Review checklist:**

```markdown
-   [ ] Follows DDD principles
-   [ ] Controllers are thin
-   [ ] Business logic in Actions
-   [ ] Repository pattern used correctly
-   [ ] DTOs for data transfer
-   [ ] Tests cover changes
-   [ ] No obvious security issues
-   [ ] Error handling appropriate
-   [ ] Documentation updated
```

## Documentation Standards

### Code Comments

**Comment why, not what:**

```php
// ✓ Good - Explains reasoning
// We use soft deletes because transactions reference categories
// and we need to maintain historical data integrity
$table->softDeletes();

// ✗ Bad - Obvious
// Add soft deletes column
$table->softDeletes();
```

**PHPDoc for public APIs:**

```php
// ✓ Good - Documented public interface
/**
 * Create a new category.
 *
 * @param CategoryData $data The category data
 * @return Category The created category
 * @throws DomainException When name is duplicate
 */
public function execute(CategoryData $data): Category

// ✗ Bad - No documentation
public function execute(CategoryData $data): Category
```

### README Updates

**Keep documentation current:**

-   Update when adding features
-   Document breaking changes
-   Include migration steps
-   Add examples for new APIs

## Performance Monitoring

### Identify Slow Queries

**Use Laravel Debugbar in development:**

```php
// Identifies N+1 queries
// Shows query execution time
// Highlights duplicate queries
```

**Log slow queries in production:**

```php
// config/database.php
'connections' => [
    'pgsql' => [
        // Log queries > 1000ms
        'options' => [
            PDO::ATTR_TIMEOUT => 1000,
        ],
    ],
],
```

### Monitor Key Metrics

**Track in production:**

-   Response time (p50, p95, p99)
-   Error rate
-   Database query time
-   Cache hit ratio
-   Queue processing time
-   Memory usage

## Deployment Best Practices

### Environment Configuration

**Never commit secrets:**

```bash
# ✓ Good - Use environment variables
DB_PASSWORD=secret

# ✗ Bad - Hardcoded
$password = 'secret123';
```

**Use different configs per environment:**

```php
// ✓ Good - Environment-aware
'debug' => env('APP_DEBUG', false),
'cache_ttl' => env('CACHE_TTL', 3600),

// ✗ Bad - Hardcoded
'debug' => true,
'cache_ttl' => 60,
```

### Pre-Deployment Checklist

```bash
# Code quality
just quality

# Tests
just test

# Database
just migrate --pretend  # Dry run

# Build
just build-prod

# Backup
just db-backup
```

## Maintenance

### Regular Tasks

**Weekly:**

-   Review logs for errors
-   Check performance metrics
-   Update dependencies (security patches)
-   Clean up stale branches

**Monthly:**

-   Run `docker system prune`
-   Review and archive old logs
-   Database performance tuning
-   Security audit

**Quarterly:**

-   Major dependency updates
-   Performance optimization review
-   Architecture review
-   Documentation audit

## Resources

### Internal Documentation

-   [README.md](../README.md) - Setup instructions
-   [CONTRIBUTING.md](../CONTRIBUTING.md) - Development workflow
-   [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
-   [.development-context/rules/](../.development-context/rules/) - Detailed coding rules
-   [.development-context/ADRs/](../.development-context/ADRs/) - Architecture decisions

### External Resources

-   [Laravel Documentation](https://laravel.com/docs)
-   [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
-   [Laravel Beyond CRUD](https://laravel-beyond-crud.com/)
-   [Domain-Driven Design (Eric Evans)](https://www.domainlanguage.com/ddd/)
-   [Clean Architecture (Robert Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Quick Reference

### Command Cheat Sheet

```bash
# Development
just dev              # Start environment
just dev-stop         # Stop environment
just dev-logs         # View logs

# Database
just migrate          # Run migrations
just migrate-fresh    # Reset database
just db-backup        # Backup database

# Code Quality
just phpstan          # Static analysis
just pint             # Fix code style
just test             # Run tests
just quality          # All checks

# Application
just artisan [cmd]    # Run artisan command
just composer [cmd]   # Run composer command
just ssh              # SSH into container
```

### Common Patterns

```php
// Controller → Action → Repository
Controller::method()
    → Action::execute(DTO)
        → Repository::method(DTO)
            → Model

// Error handling
try {
    $result = $action->execute($data);
} catch (DomainException $e) {
    // Handle domain errors
} catch (Exception $e) {
    // Handle unexpected errors
}

// Testing
it('does something', function () {
    // Arrange
    $data = ...;

    // Act
    $result = $action->execute($data);

    // Assert
    expect($result)->toBe(...);
});
```
