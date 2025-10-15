<?php

declare(strict_types=1);

namespace App\Domains\Categories\Infrastructure\Repositories;

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Repositories\ICategoryRepository;
use App\Domains\Categories\Exceptions\{
  CategoryNotFoundException,
  CategoryAlreadyExistsException,
  CategoryHasTransactionsException
};
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Models\Category as CategoryModel;
use Illuminate\Support\Facades\DB;

/**
 * Category Repository Implementation
 *
 * Eloquent-based implementation of ICategoryRepository.
 * Handles all data persistence operations with proper validation and error handling.
 */
class CategoryRepository implements ICategoryRepository
{
  public function __construct(
    private CategoryMapper $mapper
  ) {}

  /**
   * Find all categories with pagination
   *
   * @param int $page Page number (1-indexed)
   * @param int $limit Items per page
   * @return array{data: Category[], pagination: array{currentPage: int, totalPages: int, totalItems: int, itemsPerPage: int}}
   */
  public function findAll(int $page = 1, int $limit = 20): array
  {
    $query = CategoryModel::query();

    $total = $query->count();
    $categories = $query
      ->orderBy('created_at', 'desc')
      ->skip(($page - 1) * $limit)
      ->take($limit)
      ->get();

    return [
      'data' => $this->mapper->toEntityCollection($categories),
      'pagination' => [
        'currentPage' => $page,
        'totalPages' => (int) ceil($total / $limit),
        'totalItems' => $total,
        'itemsPerPage' => $limit,
      ]
    ];
  }

  /**
   * Find category by ID
   *
   * @param int $id Category ID
   * @return Category
   * @throws CategoryNotFoundException
   */
  public function findById(int $id): Category
  {
    $model = CategoryModel::find($id);

    if (!$model) {
      throw new CategoryNotFoundException("Category with ID {$id} not found");
    }

    return $this->mapper->toEntity($model);
  }

  /**
   * Create a new category
   *
   * @param Category $category Category entity to persist
   * @return Category Persisted category with ID assigned
   * @throws CategoryAlreadyExistsException If name already exists
   */
  public function create(Category $category): Category
  {
    if ($this->existsByName($category->getName())) {
      throw new CategoryAlreadyExistsException(
        "Category with name '{$category->getName()}' already exists"
      );
    }

    $model = $this->mapper->toModel($category);
    $model->save();

    return $this->mapper->toEntity($model);
  }

  /**
   * Update existing category
   *
   * @param Category $category Category entity with changes
   * @return Category Updated category
   * @throws CategoryNotFoundException
   * @throws CategoryAlreadyExistsException If new name conflicts
   */
  public function update(Category $category): Category
  {
    $model = CategoryModel::find($category->getId());

    if (!$model) {
      throw new CategoryNotFoundException(
        "Category with ID {$category->getId()} not found"
      );
    }

    if ($this->existsByName($category->getName(), $category->getId())) {
      throw new CategoryAlreadyExistsException(
        "Category with name '{$category->getName()}' already exists"
      );
    }

    // Update model fields from entity
    $model->name = $category->getName();
    $model->notes = $category->getNotes();
    $model->save();

    return $this->mapper->toEntity($model);
  }

  /**
   * Delete category by ID
   *
   * @param int $id Category ID
   * @return void
   * @throws CategoryNotFoundException
   * @throws CategoryHasTransactionsException If has associated transactions
   */
  public function delete(int $id): void
  {
    $model = CategoryModel::find($id);

    if (!$model) {
      throw new CategoryNotFoundException("Category with ID {$id} not found");
    }

    if ($this->hasTransactions($id)) {
      throw new CategoryHasTransactionsException(
        "Cannot delete category with associated transactions"
      );
    }

    if ($this->hasRecurringTransactions($id)) {
      throw new CategoryHasTransactionsException(
        "Cannot delete category with associated recurring transactions"
      );
    }

    $model->delete();
  }

  /**
   * Check if category name already exists
   *
   * @param string $name Category name to check
   * @param int|null $excludeId ID to exclude from check (for updates)
   * @return bool
   */
  public function existsByName(string $name, ?int $excludeId = null): bool
  {
    $query = CategoryModel::where('name', $name);

    if ($excludeId) {
      $query->where('id', '!=', $excludeId);
    }

    return $query->exists();
  }

  /**
   * Check if category has associated transactions
   *
   * @param int $id Category ID
   * @return bool
   */
  public function hasTransactions(int $id): bool
  {
    // Returns false until Transactions domain is implemented
    // TODO: Implement when transactions table exists
    return false;
  }

  /**
   * Check if category has associated recurring transactions
   *
   * @param int $id Category ID
   * @return bool
   */
  public function hasRecurringTransactions(int $id): bool
  {
    // Returns false until RecurringTransactions domain is implemented
    // TODO: Implement when recurring_transactions table exists
    return false;
  }
}
