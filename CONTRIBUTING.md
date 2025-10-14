# Contributing to Junction Bank

## Development Workflow

### Branch Strategy

```
main (laravel-v1)
  ├── feature/TICKET-123-description
  ├── bugfix/TICKET-456-description
  └── refactor/TICKET-789-description
```

**Branch Naming:**

-   `feature/` - New functionality
-   `bugfix/` - Bug fixes
-   `refactor/` - Code improvements
-   `hotfix/` - Production emergency fixes

### Commit Guidelines

**Format:**

```
type(scope): brief description

Detailed explanation if needed.

Refs: TICKET-123
```

**Types:**

-   `feat` - New feature
-   `fix` - Bug fix
-   `refactor` - Code refactoring
-   `test` - Test updates
-   `docs` - Documentation
-   `chore` - Maintenance tasks
-   `perf` - Performance improvements

**Examples:**

```bash
feat(categories): add bulk category import
fix(transactions): resolve date parsing error
refactor(auth): extract token validation logic
test(categories): add repository unit tests
docs(api): update authentication flow
```

### Pull Request Process

1. **Create branch from main**

    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/TICKET-123-add-feature
    ```

2. **Develop with quality checks**

    ```bash
    # Make changes
    just pint              # Fix code style
    just phpstan           # Static analysis
    just test              # Run tests
    ```

3. **Commit changes**

    ```bash
    git add .
    git commit -m "feat(domain): description"
    ```

4. **Push and create PR**

    ```bash
    git push origin feature/TICKET-123-add-feature
    ```

5. **PR Requirements**

    - All tests passing
    - PHPStan clean
    - Code style compliant
    - Architecture tests passing
    - Review approved

6. **Merge**
    - Use squash and merge for features
    - Use rebase for bugfixes
    - Delete branch after merge

## Code Standards

### PHP Standards

**PSR-12 Compliance:**

-   Enforced by Laravel Pint
-   Run `just pint` before committing

**Type Safety:**

-   Strict types enabled
-   Type hints required
-   Return types required
-   Property types required (PHP 7.4+)

```php
<?php

declare(strict_types=1);

namespace App\Domains\Categories\Actions;

use App\Domains\Categories\DTOs\CategoryData;
use App\Domains\Categories\Models\Category;
use App\Domains\Categories\Repositories\CategoryRepository;

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
```

**PHPStan Level:**

-   Level 8 (maximum)
-   Run `just phpstan` regularly

### Domain-Driven Design Principles

**1. Thin Controllers**

Controllers delegate to Actions:

```php
// Good
public function store(CreateCategoryRequest $request): JsonResponse
{
    $category = $this->createCategory->execute(
        CategoryData::fromRequest($request)
    );

    return response()->json($category, 201);
}

// Bad - business logic in controller
public function store(CreateCategoryRequest $request): JsonResponse
{
    $category = Category::create([
        'name' => $request->name,
        'type' => $request->type,
    ]);

    return response()->json($category, 201);
}
```

**2. Actions Contain Business Logic**

```php
final class CreateCategoryAction
{
    public function __construct(
        private readonly CategoryRepository $repository,
        private readonly CategoryValidator $validator
    ) {}

    public function execute(CategoryData $data): Category
    {
        $this->validator->validate($data);

        return $this->repository->create($data);
    }
}
```

**3. Repository Pattern**

Abstract data access:

```php
interface CategoryRepository
{
    public function create(CategoryData $data): Category;
    public function find(int $id): ?Category;
    public function findAll(): Collection;
    public function update(int $id, CategoryData $data): Category;
    public function delete(int $id): bool;
}
```

**4. DTOs for Data Transfer**

```php
final readonly class CategoryData
{
    public function __construct(
        public string $name,
        public string $type,
        public ?string $description = null
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->string('name')->toString(),
            type: $request->string('type')->toString(),
            description: $request->string('description')->toString()
        );
    }
}
```

**5. Domain Isolation**

Each domain is self-contained:

-   No cross-domain model imports
-   Use DTOs for inter-domain communication
-   Repository interfaces define contracts

### File Organization

**Domain Structure:**

```
app/Domains/{DomainName}/
├── Actions/
│   ├── CreateCategoryAction.php
│   ├── UpdateCategoryAction.php
│   └── DeleteCategoryAction.php
├── DTOs/
│   ├── CategoryData.php
│   └── CategoryFilterData.php
├── Models/
│   └── Category.php
├── Repositories/
│   ├── CategoryRepository.php
│   └── EloquentCategoryRepository.php
├── Policies/
│   └── CategoryPolicy.php
└── Http/
    ├── Requests/
    │   ├── CreateCategoryRequest.php
    │   └── UpdateCategoryRequest.php
    └── Controllers/
        └── CategoryController.php
```

**Naming Conventions:**

-   Actions: `{Verb}{Noun}Action.php`
-   DTOs: `{Noun}Data.php`
-   Repositories: `{Noun}Repository.php` (interface), `Eloquent{Noun}Repository.php` (implementation)
-   Requests: `{Verb}{Noun}Request.php`
-   Controllers: `{Noun}Controller.php`

### Testing Standards

**Test Structure:**

```
tests/
├── Unit/
│   └── Domains/
│       └── Categories/
│           ├── Actions/
│           ├── DTOs/
│           └── Repositories/
├── Feature/
│   └── Domains/
│       └── Categories/
│           └── Http/
│               └── Controllers/
└── Architecture/
    └── DomainTest.php
```

**Test Naming:**

```php
it('creates a category with valid data', function () {
    // Arrange
    $data = CategoryData::from([
        'name' => 'Groceries',
        'type' => 'expense',
    ]);

    // Act
    $category = $this->action->execute($data);

    // Assert
    expect($category)->toBeInstanceOf(Category::class);
    expect($category->name)->toBe('Groceries');
});
```

**Coverage Requirements:**

-   Unit tests: 90%+
-   Feature tests: Critical paths
-   Architecture tests: Domain rules

**Before Committing:**

```bash
just test              # All tests
just phpstan           # Static analysis
just pint-test         # Style check
```

## Development Environment

### Initial Setup

```bash
# Clone and setup
git clone <repo>
cd junction-bank
just setup

# Verify
just health
```

### Daily Workflow

```bash
# Start environment
just dev

# Pull latest changes
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/TICKET-123-description

# Make changes
# Run quality checks
just quality

# Commit
git add .
git commit -m "feat(domain): description"

# Push
git push origin feature/TICKET-123-description

# Stop environment (end of day)
just dev-stop
```

### Common Tasks

**Database:**

```bash
just migrate           # Run new migrations
just migrate-fresh     # Reset database
just seed              # Run seeders
just db-backup         # Backup before risky changes
just psql              # Database CLI
```

**Debugging:**

```bash
just dev-logs          # View all logs
just dev-logs php      # View PHP logs
just ssh               # SSH into PHP container
just artisan tinker    # Laravel REPL
```

**Cache:**

```bash
just clean-cache       # Clear all caches
just artisan cache:clear
```

## Code Review Guidelines

### As Author

**Before Creating PR:**

1. Self-review changes
2. Run `just quality`
3. Run `just test`
4. Update tests
5. Update documentation
6. Write clear PR description

**PR Description Template:**

```markdown
## Description

Brief description of changes.

## Changes

-   Added X
-   Modified Y
-   Removed Z

## Testing

-   [ ] Unit tests added/updated
-   [ ] Feature tests added/updated
-   [ ] Manual testing completed

## Checklist

-   [ ] Code style compliant (just pint)
-   [ ] Static analysis clean (just phpstan)
-   [ ] All tests passing (just test)
-   [ ] Documentation updated
-   [ ] No breaking changes (or documented)

Refs: TICKET-123
```

### As Reviewer

**Review Checklist:**

-   [ ] Code follows DDD principles
-   [ ] Controllers are thin
-   [ ] Actions contain business logic
-   [ ] Repository pattern used
-   [ ] DTOs used for data transfer
-   [ ] Type hints present
-   [ ] Tests cover changes
-   [ ] No obvious security issues
-   [ ] Performance considerations
-   [ ] Error handling appropriate

**Review Tone:**

-   Be constructive
-   Explain "why" in feedback
-   Approve when standards met
-   Request changes for violations

## Architecture Decisions

All significant architecture decisions must be documented as ADRs.

**ADR Template:**

```markdown
# ADR-NNN: Title

## Status

Proposed | Accepted | Deprecated | Superseded

## Context

What problem are we solving?

## Decision

What did we decide?

## Consequences

What are the tradeoffs?

## Alternatives Considered

What else did we consider?
```

**Location:** `.development-context/ADRs/NNN-title.md`

## Documentation Standards

**Code Comments:**

```php
/**
 * Create a new category.
 *
 * @param CategoryData $data The category data
 * @return Category The created category
 * @throws ValidationException When data is invalid
 */
public function execute(CategoryData $data): Category
{
    // Validate category doesn't already exist
    if ($this->repository->existsByName($data->name)) {
        throw ValidationException::withMessages([
            'name' => 'Category already exists',
        ]);
    }

    return $this->repository->create($data);
}
```

**README Updates:**

-   Update when adding features
-   Update when changing setup
-   Keep examples current

**API Documentation:**

-   Document all public endpoints
-   Include request/response examples
-   Document error responses

## Performance Guidelines

**Database:**

-   Use eager loading (`with()`)
-   Index foreign keys
-   Avoid N+1 queries
-   Use database transactions

**Caching:**

-   Cache expensive queries
-   Use Redis for sessions
-   Cache configuration in production

**Optimization:**

-   Profile before optimizing
-   Use Laravel Debugbar in development
-   Monitor query counts

## Security Guidelines

**Input Validation:**

-   Use Form Requests
-   Validate all user input
-   Sanitize output

**Authentication:**

-   Use Laravel Sanctum
-   Implement rate limiting
-   Secure API tokens

**Authorization:**

-   Use Policies
-   Check permissions in controllers
-   Fail closed (deny by default)

**Data Protection:**

-   Never commit secrets
-   Use environment variables
-   Encrypt sensitive data

## Troubleshooting

**Tests Failing:**

```bash
just clean              # Clean environment
just setup              # Fresh setup
just test               # Retry
```

**Permission Errors:**

```bash
echo "USER_ID=$(id -u)" >> .env
echo "GROUP_ID=$(id -g)" >> .env
just build-dev
```

**Database Issues:**

```bash
just migrate-fresh      # Reset database
just db-backup          # Backup if needed
just psql               # Check connection
```

**Style/Stan Errors:**

```bash
just pint               # Auto-fix style
just phpstan --verbose  # Detailed errors
```

## Resources

-   [Domain-Driven Design Rules](.development-context/rules/01-domain-driven-design.md)
-   [Repository Pattern](.development-context/rules/02-repository-pattern.md)
-   [API Routes Delegation](.development-context/rules/04-api-routes-delegate-to-actions.md)
-   [Docker Architecture](docker/README.md)
-   [Architecture Decisions](.development-context/ADRs/)

## Questions?

1. Check `.development-context/` documentation
2. Review existing domain implementations
3. Check architecture tests for examples
4. Run `just health` for diagnostics
