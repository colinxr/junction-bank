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
    it('converts model to entity correctly', function () {
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => 'Test notes',
        'created_at' => Carbon::now(),
        'updated_at' => Carbon::now()
      ]);
      $model->id = 1;

      $entity = $this->mapper->toEntity($model);

      expect($entity)->toBeInstanceOf(Category::class);
      expect($entity->getId())->toBe(1);
      expect($entity->getName())->toBe('Test Category');
      expect($entity->getNotes())->toBe('Test notes');
      expect($entity->getCreatedAt())->toBeInstanceOf(Carbon::class);
    });

    it('handles null timestamps in to entity', function () {
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => null,
        'created_at' => null,
        'updated_at' => null
      ]);
      $model->id = 1;

      $entity = $this->mapper->toEntity($model);

      expect($entity)->toBeInstanceOf(Category::class);
      expect($entity->getId())->toBe(1);
      expect($entity->getName())->toBe('Test Category');
      expect($entity->getNotes())->toBeNull();
      expect($entity->getCreatedAt())->toBeNull();
    });

    it('handles empty notes field', function () {
      $model = CategoryModel::factory()->make([
        'name' => 'Test Category',
        'notes' => '',
        'created_at' => Carbon::now()
      ]);
      $model->id = 1;

      $entity = $this->mapper->toEntity($model);

      expect($entity->getNotes())->toBe('');
    });
  });

  describe('toModel', function () {
    it('converts entity to model correctly', function () {
      $entity = new Category(
        name: 'Test Category',
        notes: 'Test notes',
        id: 1,
        createdAt: Carbon::now()
      );

      $model = $this->mapper->toModel($entity);

      expect($model)->toBeInstanceOf(CategoryModel::class);
      expect($model->id)->toBe(1);
      expect($model->name)->toBe('Test Category');
      expect($model->notes)->toBe('Test notes');
      expect($model->created_at)->toBeInstanceOf(Carbon::class);
    });

    it('handles null id in to model', function () {
      $entity = new Category(
        name: 'Test Category',
        notes: null,
        id: null,
        createdAt: null
      );

      $model = $this->mapper->toModel($entity);

      expect($model)->toBeInstanceOf(CategoryModel::class);
      expect($model->id)->toBeNull();
      expect($model->name)->toBe('Test Category');
      expect($model->notes)->toBeNull();
      expect($model->created_at)->toBeNull();
    });
  });

  describe('toEntityArray', function () {
    it('converts array of models to entities', function () {
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
      $entities = $this->mapper->toEntityArray($models);

      expect($entities)->toHaveCount(2);
      expect($entities[0])->toBeInstanceOf(Category::class);
      expect($entities[1])->toBeInstanceOf(Category::class);
      expect($entities[0]->getName())->toBe('Category 1');
      expect($entities[1]->getName())->toBe('Category 2');
    });
  });

  describe('toEntityCollection', function () {
    it('converts collection of models to entities', function () {
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
      $entities = $this->mapper->toEntityCollection($collection);

      expect($entities)->toHaveCount(2);
      expect($entities[0])->toBeInstanceOf(Category::class);
      expect($entities[1])->toBeInstanceOf(Category::class);
      expect($entities[0]->getName())->toBe('Category 1');
      expect($entities[1]->getName())->toBe('Category 2');
    });
  });

  describe('round-trip conversion', function () {
    it('preserves all entity properties in conversion', function () {
      $originalEntity = new Category(
        name: 'Original Category',
        notes: 'Original notes',
        id: 42,
        createdAt: Carbon::parse('2023-01-01 12:00:00')
      );

      $model = $this->mapper->toModel($originalEntity);
      $convertedEntity = $this->mapper->toEntity($model);

      expect($convertedEntity->getId())->toBe($originalEntity->getId());
      expect($convertedEntity->getName())->toBe($originalEntity->getName());
      expect($convertedEntity->getNotes())->toBe($originalEntity->getNotes());
      expect($convertedEntity->getCreatedAt())->toEqual($originalEntity->getCreatedAt());
    });
  });
});
