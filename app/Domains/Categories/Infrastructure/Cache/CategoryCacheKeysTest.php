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

    it('generates unique keys for different parameters', function () {
        // Test that different parameters generate different keys
        $key1 = CategoryCacheKeys::list(123, 1, 20, 'expense');
        $key2 = CategoryCacheKeys::list(123, 2, 20, 'expense'); // different page
        $key3 = CategoryCacheKeys::list(123, 1, 20, 'income');   // different type
        $key4 = CategoryCacheKeys::list(456, 1, 20, 'expense');  // different user
        $key5 = CategoryCacheKeys::list(123, 1, 10, 'expense');  // different limit

        expect($key1)->not->toBe($key2);
        expect($key1)->not->toBe($key3);
        expect($key1)->not->toBe($key4);
        expect($key1)->not->toBe($key5);
    });
});
