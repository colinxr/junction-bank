<?php

declare(strict_types=1);

namespace App\Domains\Categories\Repositories;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\CategoryNotFoundException;
use App\Domains\Categories\Exceptions\CategoryAlreadyExistsException;
use App\Domains\Categories\Exceptions\CategoryHasTransactionsException;

/**
 * Category Repository Interface
 *
 * Defines the contract for category data persistence operations.
 * Implementations should handle database operations, caching, and
 * transaction management.
 *
 * @package App\Domains\Categories\Repositories
 */
interface ICategoryRepository
{
  /**
   * Find all categories with optional filtering and pagination
   *
   * @param int $page Page number (1-indexed), default 1
   * @param int $limit Items per page, default 20, max 100
   * @return array{data: Category[], pagination: array{currentPage: int, totalPages: int, totalItems: int, itemsPerPage: int}}
   * @note Cache by page/limit/type combination
   */
  public function findAll(int $page = 1, int $limit = 20): array;

  /**
   * Find category by ID
   *
   * @param int $id Category ID
   * @return Category
   * @throws CategoryNotFoundException
   * @note Cache by ID
   */
  public function findById(int $id): Category;

  /**
   * Create a new category
   *
   * @param Category $category Category entity to persist
   * @return Category Persisted category with ID assigned
   * @throws CategoryAlreadyExistsException If name already exists
   * @note Invalidates list caches
   */
  public function create(Category $category): Category;

  /**
   * Update existing category
   *
   * @param Category $category Category entity with changes
   * @return Category Updated category
   * @throws CategoryNotFoundException
   * @throws CategoryAlreadyExistsException If new name conflicts
   * @note Invalidates specific category and list caches
   */
  public function update(Category $category): Category;

  /**
   * Delete category by ID
   *
   * @param int $id Category ID
   * @return void
   * @throws CategoryNotFoundException
   * @throws CategoryHasTransactionsException If has associated transactions
   * @note Checks both transactions and recurring_transactions before deletion
   */
  public function delete(int $id): void;

  /**
   * Check if category name already exists
   *
   * @param string $name Category name to check
   * @param int|null $excludeId ID to exclude from check (for updates)
   * @return bool
   * @note Used by create and update operations to enforce unique names
   */
  public function existsByName(string $name, ?int $excludeId = null): bool;

  /**
   * Check if category has associated transactions
   *
   * @param int $id Category ID
   * @return bool
   * @note Used before deletion to prevent orphaned transactions
   */
  public function hasTransactions(int $id): bool;

  /**
   * Check if category has associated recurring transactions
   *
   * @param int $id Category ID
   * @return bool
   * @note Used before deletion to prevent orphaned recurring transactions
   */
  public function hasRecurringTransactions(int $id): bool;
}
