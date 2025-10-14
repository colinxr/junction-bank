<?php

use App\Domains\Categories\Infrastructure\Cache\CategoryCacheKeys;

describe('CategoryCacheKeys Helper', function () {
    
    it('generates list cache key with all parameters', function () {
        $key = CategoryCacheKeys::list(123, 1, 20, 'expense');
        expect($key)->toBe('categories:list:123:1:20:expense');
    });

    it('generates list cache key without type filter', function () {
        $key = CategoryCacheKeys::list(456, 2, 10, null);
        expect($key)->toBe('categories:list:456:2:10');
    });

    it('generates single category cache key', function () {
        $key = CategoryCacheKeys::single(789);
        expect($key)->toBe('categories:789');
    });

    it('generates user categories cache key', function () {
        $key = CategoryCacheKeys::userCategories(321);
        expect($key)->toBe('categories:user:321');
    });

    it('generates list invalidation pattern', function () {
        $pattern = CategoryCacheKeys::listPattern(654);
        expect($pattern)->toBe('categories:list:654:*');
    });

    it('returns correct list TTL', function () {
        $ttl = CategoryCacheKeys::getListTTL();
        expect($ttl)->toBe(3600); // 1 hour
    });

    it('returns correct single TTL', function () {
        $ttl = CategoryCacheKeys::getSingleTTL();
        expect($ttl)->toBe(86400); // 24 hours
    });

    it('returns correct user list TTL', function () {
        $ttl = CategoryCacheKeys::getUserListTTL();
        expect($ttl)->toBe(3600); // 1 hour
    });

    it('generates unique keys for different pages', function () {
        $key1 = CategoryCacheKeys::list(123, 1, 20);
        $key2 = CategoryCacheKeys::list(123, 2, 20);
        
        expect($key1)->not->toBe($key2);
        expect($key1)->toBe('categories:list:123:1:20');
        expect($key2)->toBe('categories:list:123:2:20');
    });

    it('generates unique keys for different types', function () {
        $key1 = CategoryCacheKeys::list(123, 1, 20, 'expense');
        $key2 = CategoryCacheKeys::list(123, 1, 20, 'income');
        
        expect($key1)->not->toBe($key2);
        expect($key1)->toBe('categories:list:123:1:20:expense');
        expect($key2)->toBe('categories:list:123:1:20:income');
    });

    it('generates unique keys for different users', function () {
        $key1 = CategoryCacheKeys::list(123, 1, 20);
        $key2 = CategoryCacheKeys::list(456, 1, 20);
        
        expect($key1)->not->toBe($key2);
        expect($key1)->toBe('categories:list:123:1:20');
        expect($key2)->toBe('categories:list:456:1:20');
    });

    it('generates unique keys for different limits', function () {
        $key1 = CategoryCacheKeys::list(123, 1, 10);
        $key2 = CategoryCacheKeys::list(123, 1, 20);
        
        expect($key1)->not->toBe($key2);
        expect($key1)->toBe('categories:list:123:1:10');
        expect($key2)->toBe('categories:list:123:1:20');
    });
});
