# Determining Statefulness in PHP Classes

## What is "State"?

**State** = data that persists between method calls and can affect future behavior.

## Stateless vs Stateful Classes

### Stateless Class (Safe for `bind()`)

```php
// NO instance variables that change after construction
class CategoryMapper
{
    // No properties at all - pure transformation
    public function toEntity(CategoryModel $model): Category
    {
        return new Category(
            name: $model->name,
            notes: $model->notes,
            id: $model->id,
            createdAt: $model->created_at
        );
    }

    public function toModel(Category $entity): CategoryModel
    {
        $model = new CategoryModel();
        $model->name = $entity->getName();
        $model->notes = $entity->getNotes();
        return $model;
    }
}
// ✅ STATELESS - output only depends on input
```

### Stateful Class (Needs `singleton()`)

```php
// HAS instance variables that change over time
class QueryCache
{
    private array $cache = [];  // ❌ MUTABLE STATE
    private int $hitCount = 0;  // ❌ MUTABLE STATE

    public function get(string $key): ?array
    {
        $this->hitCount++;  // State changes!
        return $this->cache[$key] ?? null;
    }

    public function set(string $key, array $value): void
    {
        $this->cache[$key] = $value;  // State changes!
    }
}
// ❌ STATEFUL - behavior depends on previous calls
```

## How to Identify State

### 1. Check for Mutable Properties

```php
class Example
{
    // These are STATE if they change after construction:
    private array $items = [];           // ❌ If modified by methods
    private int $counter = 0;            // ❌ If incremented
    private ?User $currentUser = null;   // ❌ If set/changed later

    // These are NOT state (immutable after construction):
    private readonly string $apiKey;     // ✅ readonly
    private DatabaseConnection $db;      // ✅ If never reassigned
    private LoggerInterface $logger;     // ✅ Dependencies (constant)
}
```

### 2. Look for Methods That Modify Properties

```php
class StatefulExample
{
    private array $data = [];

    // ❌ MODIFIES STATE
    public function addItem(string $item): void
    {
        $this->data[] = $item;  // Changes $this->data
    }

    // ❌ MODIFIES STATE
    private int $count = 0;
    public function increment(): void
    {
        $this->count++;  // Changes $this->count
    }
}

class StatelessExample
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;  // Set once in constructor
    }

    // ✅ DOESN'T MODIFY STATE
    public function transform(array $data): array
    {
        $this->logger->info('Transforming data');
        return array_map('strtoupper', $data);  // Pure function
    }
}
```

### 3. Test: Can Two Calls Interfere?

```php
// Stateless: Order doesn't matter, no interference
$mapper = new CategoryMapper();
$result1 = $mapper->toEntity($model1);  // Independent
$result2 = $mapper->toEntity($model2);  // Independent
// ✅ Each call is independent

// Stateful: Order matters, calls affect each other
$cache = new QueryCache();
$cache->set('key1', ['data']);   // Affects future calls
$result1 = $cache->get('key1');  // Returns data from previous call
$result2 = $cache->get('key1');  // hitCount increased again
// ❌ Previous calls affect current behavior
```

## Repository Analysis

### CategoryRepository (Likely Stateless)

```php
class CategoryRepository implements ICategoryRepository
{
    // These are DEPENDENCIES (injected once, never change)
    private CategoryMapper $mapper;      // ✅ Dependency
    private Connection $db;              // ✅ Laravel manages this
    private Cache $cache;                // ✅ Laravel manages this

    public function __construct(CategoryMapper $mapper)
    {
        $this->mapper = $mapper;  // Set once, never changes
    }

    public function findById(int $id): Category
    {
        // No properties modified
        // Uses external services (DB, cache)
        // Returns new objects
        return $this->mapper->toEntity(
            CategoryModel::find($id)
        );
    }
}
// ✅ STATELESS - can use bind() or singleton()
```

### When Repository IS Stateful (Bad Design)

```php
class BadRepository
{
    private ?User $contextUser = null;   // ❌ MUTABLE STATE
    private array $queryResults = [];    // ❌ MUTABLE STATE

    public function setUser(User $user): void
    {
        $this->contextUser = $user;  // Changes state
    }

    public function findAll(): array
    {
        // Uses $this->contextUser set in previous call
        $results = CategoryModel::where('user_id', $this->contextUser->id)->get();
        $this->queryResults[] = $results;  // Accumulates state
        return $results;
    }
}
// ❌ STATEFUL - MUST be singleton() AND is bad design
// Better: Pass user as parameter to findAll()
```

## Decision Matrix

| Characteristic                          | Stateless (bind) | Stateful (singleton) |
| --------------------------------------- | ---------------- | -------------------- |
| **Mutable properties**                  | No               | Yes                  |
| **Properties change after constructor** | No               | Yes                  |
| **Stores request data**                 | No               | Yes (bad!)           |
| **Accumulates data**                    | No               | Yes                  |
| **Method calls independent**            | Yes              | No                   |
| **Thread-safe**                         | Yes              | Depends              |
| **Testability**                         | Easy             | Harder               |

## Common Patterns

### Always Stateless (use `bind()`)

-   **Mappers/Transformers** - Pure data transformation
-   **Validators** - Check rules, return results
-   **Value Objects** - Immutable by design
-   **DTOs** - Data transfer only
-   **Formatters** - Format data for display

### Usually Stateless (use `bind()`)

-   **Repositories** - If they only coordinate with external services
-   **Services** - If they only orchestrate operations
-   **Handlers** - If they process one request at a time

### Often Stateful (use `singleton()`)

-   **Connection Pools** - Manage reusable connections
-   **Caches** - Store data across requests
-   **Registries** - Global object storage
-   **Loggers** - May buffer logs
-   **Event Dispatchers** - Accumulate listeners

## Red Flags for Statefulness

```php
// 🚩 RED FLAGS - Likely Stateful
class Example
{
    private array $items = [];           // Accumulator
    private int $counter = 0;            // Counter
    private ?Model $current = null;      // Current context
    private array $history = [];         // Historical data

    public function addItem($item) { }   // Methods that "add"
    public function setCurrent($x) { }   // Methods that "set"
    public function increment() { }      // Methods that "increment"
    public function remember($x) { }     // Methods that "remember"
}
```

## Quick Checklist

```php
class MyClass
{
    // [ ] Are all properties set in __construct?
    // [ ] Are properties readonly or never reassigned?
    // [ ] Do methods only use their parameters + dependencies?
    // [ ] Can I call methods in any order without side effects?
    // [ ] Does each method return same output for same input?

    // If ALL are YES: ✅ Stateless - use bind()
    // If ANY are NO:  ⚠️  Check if state is necessary
}
```

## Best Practices

1. **Default to stateless** - Easier to reason about
2. **Pass data as parameters** - Not as instance properties
3. **Use readonly** - PHP 8.1+ for immutable properties
4. **Avoid setters** - Properties set in constructor only
5. **Test for state** - Create instance, call method twice, check for differences

## Example: Refactoring Stateful to Stateless

### Before (Stateful - Bad)

```php
class UserRepository
{
    private ?int $currentUserId = null;  // ❌ State

    public function setCurrentUser(int $userId): void
    {
        $this->currentUserId = $userId;
    }

    public function findCategories(): array
    {
        return CategoryModel::where('user_id', $this->currentUserId)->get();
    }
}
```

### After (Stateless - Good)

```php
class UserRepository
{
    // ✅ No state - user passed as parameter
    public function findCategories(int $userId): array
    {
        return CategoryModel::where('user_id', $userId)->get();
    }
}
```

## For Your CategoryRepository

Based on the interface you have:

```php
interface ICategoryRepository
{
    public function findAll(int $page = 1, int $limit = 20, ?string $type = null): array;
    public function findById(int $id): Category;
    public function create(Category $category): Category;
    // ... etc
}
```

**Analysis:**

-   ✅ No properties modified between calls
-   ✅ All data comes from parameters
-   ✅ Uses external services (DB, Cache) that Laravel manages
-   ✅ Each method call is independent

**Conclusion: STATELESS - Use `bind()`**

```php
// Recommended
$this->app->bind(ICategoryRepository::class, function ($app) {
    return new CategoryRepository(
        $app->make(CategoryMapper::class)
    );
});
```
