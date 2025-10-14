<?php

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
   * @param string|null $type Filter type
   * @return string Cache key
   */
  public static function list(int $userId, int $page, int $limit, ?string $type = null): string
  {
    $typeSegment = $type ? ":{$type}" : '';
    return "categories:list:{$userId}:{$page}:{$limit}{$typeSegment}";
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
   * Generate cache key for user's all categories
   *
   * @param int $userId User ID
   * @return string Cache key
   */
  public static function userCategories(int $userId): string
  {
    return "categories:user:{$userId}";
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
