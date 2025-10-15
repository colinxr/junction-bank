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
   * Convert multiple models to array of entities
   * Accepts both arrays and Eloquent Collections
   *
   * @param iterable $models Array or Collection of database models
   * @return Category[] Array of domain entities
   */
  public function toEntities(iterable $models): array
  {
    $items = $models instanceof Collection ? $models->all() : $models;

    return array_map(
      fn(CategoryModel $model) => $this->toEntity($model),
      $items
    );
  }

  /**
   * Convert multiple entities to array of models
   * Accepts both arrays and other iterables
   *
   * @param iterable $entities Array or iterable of domain entities
   * @return CategoryModel[] Array of database models
   */
  public function toModels(iterable $entities): array
  {
    $items = is_array($entities) ? $entities : iterator_to_array($entities);

    return array_map(
      fn(Category $entity) => $this->toModel($entity),
      $items
    );
  }
}
