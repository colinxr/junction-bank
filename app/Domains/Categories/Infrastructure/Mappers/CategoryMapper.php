<?php

declare(strict_types=1);

namespace App\Domains\Categories\Infrastructure\Mappers;

use App\Domains\Categories\Entities\Category;
use App\Models\Category as CategoryModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

/**
 * Category Mapper
 *
 * Handles conversion between domain entities and database models.
 * Provides type-safe mapping with proper null handling.
 */
class CategoryMapper
{
  /**
   * Convert database model to domain entity
   *
   * @param CategoryModel $model Database model
   * @return Category Domain entity
   */
  public function toEntity(CategoryModel $model): Category
  {
    return new Category(
      name: $model->name,
      notes: $model->notes,
      id: $model->id,
      createdAt: $model->created_at ? Carbon::parse($model->created_at) : null
    );
  }

  /**
   * Convert domain entity to database model
   *
   * @param Category $category Domain entity
   * @return CategoryModel Database model
   */
  public function toModel(Category $category): CategoryModel
  {
    $model = new CategoryModel();

    if ($category->getId()) {
      $model->id = $category->getId();
    }

    $model->name = $category->getName();
    $model->notes = $category->getNotes();

    if ($category->getCreatedAt()) {
      $model->created_at = $category->getCreatedAt();
    }

    return $model;
  }

  /**
   * Convert array of models to array of entities
   *
   * @param CategoryModel[] $models Array of database models
   * @return Category[] Array of domain entities
   */
  public function toEntityArray(array $models): array
  {
    return array_map(
      fn(CategoryModel $model) => $this->toEntity($model),
      $models
    );
  }

  /**
   * Convert collection of models to array of entities
   *
   * @param Collection $collection Eloquent collection of models
   * @return Category[] Array of domain entities
   */
  public function toEntityCollection(Collection $collection): array
  {
    return $collection->map(
      fn(CategoryModel $model) => $this->toEntity($model)
    )->toArray();
  }
}
