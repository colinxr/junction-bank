# TICKET-005: Redis Cache Configuration

**Estimate:** 1-2 hours  
**Priority:** High  
**Dependencies:** None  
**PRD Reference:** Lines 505-525

## Overview

Configure Redis caching infrastructure for the Categories domain. Create a cache helper class that encapsulates cache key generation and TTL configuration based on the PRD caching strategy.

## Technical Specifications

### Redis Configuration

Ensure Redis is configured in `config/cache.php`:

```php
'redis' => [
    'driver' => 'redis',
    'connection' => 'cache',
    'lock_connection' => 'default',
],
```

### Cache Helper Location

`app/Domains/Categories/Infrastructure/Cache/CategoryCacheKeys.php`

### Cache Helper Implementation

```php
namespace App\Domains\Categories\Infrastructure\Cache;

/**
 * Category Cache Keys Helper
 *
 * Centralizes cache key generation and TTL management for categories.
 * Based on PRD caching strategy (lines 507-525).
 */
class CategoryCacheKeys
{
    // TTL Constants (in seconds)
    private const LIST_TTL = 3600;        // 1 hour
    private const SINGLE_TTL = 86400;     // 24 hours
    private const USER_LIST_TTL = 3600;   // 1 hour

    /**
     * Generate cache key for paginated category list
     *
     * @param int $userId User ID
     * @param int $page Page number
     * @param int $limit Items per page
     * @return string Cache key
     */
    public static function list(int $page, int $limit): string
    {
        return "categories:list::{$page}:{$limit}";
    }

    /**
     * Generate cache key for single category
     *
     * @param int $id Category ID
     * @return string Cache key
     */
    public static function single(int $id): string
    {
        return "categories:{$id}";
    }

    /**
     * Generate pattern for invalidating all user list caches
     *
     * @param int $userId User ID
     * @return string Cache key pattern
     */
    public static function listPattern(int $userId): string
    {
        return "categories:list:{$userId}:*";
    }

    /**
     * Get TTL for list queries
     *
     * @return int TTL in seconds
     */
    public static function getListTTL(): int
    {
        return self::LIST_TTL;
    }

    /**
     * Get TTL for single category
     *
     * @return int TTL in seconds
     */
    public static function getSingleTTL(): int
    {
        return self::SINGLE_TTL;
    }

    /**
     * Get TTL for user categories
     *
     * @return int TTL in seconds
     */
    public static function getUserListTTL(): int
    {
        return self::USER_LIST_TTL;
    }
}
```

### Cache Key Patterns (PRD Lines 507-525)

```
categories:list:{page}:{limit}           # Paginated lists
categories:{id}                                     # Single category
categories:user                          # All user categories
```

### Cache TTL Strategy

| Cache Type      | TTL      | Reason                                          |
| --------------- | -------- | ----------------------------------------------- |
| List queries    | 1 hour   | Frequent changes, balance freshness/performance |
| Single category | 24 hours | Rarely change once created                      |
| User categories | 1 hour   | Moderate frequency of changes                   |

### Invalidation Rules

**Triggers:** Create, Update, Delete operations

**Invalidate:**

-   `categories:{id}` - Specific category

## Implementation Tasks

1. Verify Redis configuration in `config/cache.php`
2. Create `CategoryCacheKeys` helper class
3. Implement cache key generation methods
4. Implement TTL getter methods
5. Add PHPDoc documentation
6. Test Redis connectivity
7. Write cache key generation tests
8. Document usage examples

## Test Cases

### Cache Key Generation Tests

```php
describe('CategoryCacheKeys Helper', function () {
    it('generates list cache key with all parameters')
    it('generates single category cache key')
    it('generates user categories cache key')
    it('generates list invalidation pattern')
    it('returns correct list TTL')
    it('returns correct single TTL')
    it('returns correct user list TTL')
    it('generates unique keys for different pages')
});
```

## Acceptance Criteria

-   [ ] Redis configured in `config/cache.php`
-   [ ] CategoryCacheKeys class created
-   [ ] All cache key methods implemented
-   [ ] TTL constants match PRD specifications
-   [ ] TTL getter methods implemented
-   [ ] Pattern generation for invalidation
-   [ ] PHPDoc on all methods
-   [ ] All cache key generation tests pass
-   [ ] Usage documentation in class comments

## Validation Checklist

-   [ ] Test Redis connection: `php artisan tinker` → `Cache::put('test', 'value')`
-   [ ] Verify TTL: `Cache::get('test')` immediately returns value
-   [ ] Verify cache key format matches PRD patterns
-   [ ] Run tests: `php artisan test --filter=CategoryCacheTest`
-   [ ] Generate keys for different scenarios and verify uniqueness

## Usage Example

```php
// In repository
use App\Domains\Categories\Infrastructure\Cache\CategoryCacheKeys;

$key = CategoryCacheKeys::list($userId, 1, 20);
$ttl = CategoryCacheKeys::getListTTL();

Cache::remember($key, $ttl, function () {
    // Fetch from database
});

// Invalidation
$pattern = CategoryCacheKeys::listPattern($userId);
// Delete all matching keys
```

## Notes

-   Redis must be running and accessible
-   Cache helper is infrastructure layer (not domain)
-   Keys are designed to be human-readable for debugging
-   Pattern matching used for bulk invalidation
-   TTL values can be adjusted based on monitoring data

## Changelog

| Version | Date       | Author   | Changes                                                                                                                       |
| ------- | ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2024-12-19 | Dev Team | Removed `type` parameter from cache key generation per PRD simplification - categories no longer support type-based filtering |

## Related PRD Sections

-   **Caching Strategy:** Lines 505-525
-   **Cache Keys:** Lines 507-512
-   **Cache TTL:** Lines 514-518
-   **Invalidation Rules:** Lines 520-525
-   **Repository Implementation:** Lines 431-435
