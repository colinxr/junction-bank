<?php

declare(strict_types=1);

use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Domains\Categories\Entities\Category;
use App\Models\Category as CategoryModel;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

beforeEach(function () {
  $this->mapper = new CategoryMapper();
});

describe('CategoryMapper', function () {
  describe('toEntity', function () {
    it('converts model to entity with all properties', function () {
      // Arrange
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => 'Test notes',
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now()
      ]);
      $model->id = 1;

      // Act
      $entity = $this->mapper->toEntity($model);

      // Assert - Group related checks with chained assertions
      expect($entity)
        ->toBeInstanceOf(Category::class)
        ->and($entity->getId())->toBe(1)
        ->and($entity->getName())->toBe('Test Category')
        ->and($entity->getNotes())->toBe('Test notes')
        ->and($entity->getCreatedAt())->toBeInstanceOf(Carbon::class);
    });

    it('handles null timestamps and notes in model conversion', function () {
      // Arrange
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => null,
        'created_at' => null,
        'updated_at' => null
      ]);
      $model->id = 1;

      // Act
      $entity = $this->mapper->toEntity($model);

      // Assert
      expect($entity)
        ->toBeInstanceOf(Category::class)
        ->and($entity->getId())->toBe(1)
        ->and($entity->getName())->toBe('Test Category')
        ->and($entity->getNotes())->toBeNull()
        ->and($entity->getCreatedAt())->toBeNull();
    });

    it('handles empty string notes in model conversion', function () {
      // Arrange
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => '',
        'created_at' => Carbon::now()
      ]);
      $model->id = 1;

      // Act
      $entity = $this->mapper->toEntity($model);

      // Assert
      expect($entity->getNotes())->toBe('');
    });
  });

  describe('toModel', function () {
    it('converts entity to model with all properties', function () {
      // Arrange
      $entity = new Category(
        name: 'Test Category',
        notes: 'Test notes',
        id: 1,
        createdAt: Carbon::now()
      );

      // Act
      $model = $this->mapper->toModel($entity);

      // Assert
      expect($model)
        ->toBeInstanceOf(CategoryModel::class)
        ->and($model->id)->toBe(1)
        ->and($model->name)->toBe('Test Category')
        ->and($model->notes)->toBe('Test notes')
        ->and($model->created_at)->toBeInstanceOf(Carbon::class);
    });

    it('handles null id and timestamps in entity conversion', function () {
      // Arrange
      $entity = new Category(
        name: 'Test Category',
        notes: null,
        id: null,
        createdAt: null
      );

      // Act
      $model = $this->mapper->toModel($entity);

      // Assert
      expect($model)
        ->toBeInstanceOf(CategoryModel::class)
        ->and($model->id)->toBeNull()
        ->and($model->name)->toBe('Test Category')
        ->and($model->notes)->toBeNull()
        ->and($model->created_at)->toBeNull();
    });
  });

  describe('toEntities', function () {
    it('converts array of models to entity array', function () {
      // Arrange
      $model1 = CategoryModel::factory()->make([
        'name' => 'Category 1',
        'notes' => 'Notes 1',
        'created_at' => Carbon::now()
      ]);
      $model1->id = 1;

      $model2 = CategoryModel::factory()->withoutNotes()->make([
        'name' => 'Category 2',
        'created_at' => Carbon::now()
      ]);
      $model2->id = 2;

      $models = [$model1, $model2];

      // Act
      $entities = $this->mapper->toEntities($models);

      // Assert
      expect($entities)
        ->toHaveCount(2)
        ->and($entities[0])->toBeInstanceOf(Category::class)
        ->and($entities[1])->toBeInstanceOf(Category::class)
        ->and($entities[0]->getName())->toBe('Category 1')
        ->and($entities[1]->getName())->toBe('Category 2');
    });

    it('converts collection of models to entity array', function () {
      // Arrange
      $model1 = CategoryModel::factory()->make([
        'name' => 'Category 1',
        'notes' => 'Notes 1',
        'created_at' => Carbon::now()
      ]);
      $model1->id = 1;

      $model2 = CategoryModel::factory()->withoutNotes()->make([
        'name' => 'Category 2',
        'created_at' => Carbon::now()
      ]);
      $model2->id = 2;

      $collection = new Collection([$model1, $model2]);

      // Act
      $entities = $this->mapper->toEntities($collection);

      // Assert
      expect($entities)
        ->toHaveCount(2)
        ->and($entities[0])->toBeInstanceOf(Category::class)
        ->and($entities[1])->toBeInstanceOf(Category::class)
        ->and($entities[0]->getName())->toBe('Category 1')
        ->and($entities[1]->getName())->toBe('Category 2');
    });
  });

  describe('toModels', function () {
    it('converts array of entities to model array', function () {
      // Arrange
      $entity1 = new Category(
        name: 'Category 1',
        notes: 'Notes 1',
        id: 1,
        createdAt: Carbon::now()
      );

      $entity2 = new Category(
        name: 'Category 2',
        notes: null,
        id: 2,
        createdAt: Carbon::now()
      );

      $entities = [$entity1, $entity2];

      // Act
      $models = $this->mapper->toModels($entities);

      // Assert
      expect($models)
        ->toHaveCount(2)
        ->and($models[0])->toBeInstanceOf(CategoryModel::class)
        ->and($models[1])->toBeInstanceOf(CategoryModel::class)
        ->and($models[0]->name)->toBe('Category 1')
        ->and($models[1]->name)->toBe('Category 2')
        ->and($models[0]->notes)->toBe('Notes 1')
        ->and($models[1]->notes)->toBeNull();
    });
  });

  describe('round-trip conversion', function () {
    it('preserves all entity properties through model conversion cycle', function () {
      // Arrange
      $originalEntity = new Category(
        name: 'Original Category',
        notes: 'Original notes',
        id: 42,
        createdAt: Carbon::parse('2023-01-01 12:00:00')
      );

      // Act
      $model = $this->mapper->toModel($originalEntity);
      $convertedEntity = $this->mapper->toEntity($model);

      // Assert
      expect($convertedEntity)
        ->and($convertedEntity->getId())->toBe($originalEntity->getId())
        ->and($convertedEntity->getName())->toBe($originalEntity->getName())
        ->and($convertedEntity->getNotes())->toBe($originalEntity->getNotes())
        ->and($convertedEntity->getCreatedAt())->toEqual($originalEntity->getCreatedAt());
    });
  });
});
