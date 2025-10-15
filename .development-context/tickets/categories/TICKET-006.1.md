### **TICKET-006.1: Caching Strategy Implementation for Categories**

**Estimate:** 3-4 hours  
**Priority:** High  
**Dependencies:** TICKET-006 (Repository Implementation)  
**PRD Reference:** Lines 505-525 (Caching Strategy)

---

### **Overview**

Implement a robust caching strategy for the `CategoryRepository` using Redis. This ticket focuses on caching logic, cache invalidation, and unit tests to ensure the caching behavior is correct and efficient.

---

### **Technical Specifications**

#### **Caching Strategy**

-   **Cache Layer:** Redis
-   **Cache Keys:** Use `CategoryCacheKeys` for consistent key generation.
-   **Cache Invalidation:** Event-driven invalidation for immediate consistency.
-   **TTL (Time-to-Live):** Configure TTLs for different cache keys (e.g., single category, paginated lists).

#### **Cache Keys**

```php
class CategoryCacheKeys
{
    public static function single(int $id): string
    {
        return "category:{$id}";
    }

    public static function list(int $userId, int $page, int $limit, ?string $type): string
    {
        $typeKey = $type ? ":{$type}" : "";
        return "categories:user:{$userId}:page:{$page}:limit:{$limit}{$typeKey}";
    }

    public static function userCategories(int $userId): string
    {
        return "categories:user:{$userId}";
    }

    public static function getSingleTTL(): int
    {
        return 3600; // 1 hour
    }

    public static function getListTTL(): int
    {
        return 1800; // 30 minutes
    }
}
```

#### **Cache Invalidation**

```php
private function invalidateCache(int $id, int $userId): void
{
    // Invalidate specific category cache
    Cache::forget(CategoryCacheKeys::single($id));

    // Invalidate user's category list cache
    Cache::forget(CategoryCacheKeys::userCategories($userId));

    // Invalidate all paginated list caches for user
    $pattern = CategoryCacheKeys::listPattern($userId);
    // Implementation depends on cache driver (Redis supports pattern deletion)
}
```

#### **Unit Tests**

```php
describe('CategoryRepository Caching', function () {
    it('invalidates list cache on create')
    it('invalidates list cache on update')
    it('invalidates list cache on delete')
    it('caches findById results')
    it('invalidates specific cache on update')
    it('invalidates specific cache on delete')
});
```

---

### **Implementation Tasks**

1. **Caching Logic**

    - Implement caching for `findAll` and `findById` methods.
    - Add cache invalidation in `create`, `update`, and `delete` methods.

2. **Cache Key Management**

    - Define cache keys in `CategoryCacheKeys`.
    - Configure TTLs for different cache keys.

3. **Unit Tests**

    - Write unit tests for caching behavior.
    - Test cache invalidation scenarios.

4. **Documentation**
    - Document the caching strategy in the repository.
    - Add comments for cache-related methods.

---

### **Acceptance Criteria**

-   [ ] Caching implemented for `findAll` and `findById`.
-   [ ] Cache invalidation implemented for `create`, `update`, and `delete`.
-   [ ] Unit tests for caching behavior pass.
-   [ ] Documentation for caching strategy added.

---

### **Validation Checklist**

-   [ ] Verify cache hits and misses for `findAll` and `findById`.
-   [ ] Verify cache invalidation on `create`, `update`, and `delete`.
-   [ ] Run unit tests: `php artisan test --filter=CategoryRepositoryCachingTest`.

---

### **Notes**

-   Ensure Redis is properly configured in the environment.
-   Consider using cache tags if supported by the cache driver.
-   Monitor cache performance and adjust TTLs as needed.

---

### **Related PRD Sections**

-   **Caching Strategy:** Lines 505-525
-   **Error Handling:** Lines 593-623

---

This ticket complements TICKET-006 by focusing solely on the caching strategy, ensuring a clear separation of concerns and easier implementation.
