<?php

declare(strict_types=1);

use App\Domains\Categories\Infrastructure\Repositories\CategoryRepository;
use App\Domains\Categories\Infrastructure\Mappers\CategoryMapper;
use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\{
  CategoryNotFoundException,
  CategoryAlreadyExistsException,
  CategoryHasTransactionsException
};
use App\Models\Category as CategoryModel;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
  $this->mapper = new CategoryMapper();
  $this->repository = new CategoryRepository($this->mapper);
});

describe('CategoryRepository', function () {
  describe('findAll', function () {
    it('finds all categories with pagination', function () {
      // Create test categories
      CategoryModel::factory()->count(25)->create();

      $result = $this->repository->findAll(1, 10);

      expect($result)->toHaveKey('data');
      expect($result)->toHaveKey('pagination');
      expect($result['data'])->toHaveCount(10);
      expect($result['pagination']['currentPage'])->toBe(1);
      expect($result['pagination']['totalPages'])->toBe(3);
      expect($result['pagination']['totalItems'])->toBe(25);
      expect($result['pagination']['itemsPerPage'])->toBe(10);

      // Verify all items are Category entities
      foreach ($result['data'] as $category) {
        expect($category)->toBeInstanceOf(Category::class);
      }
    });
  });

  describe('findById', function () {
    it('finds single category by id', function () {
      $model = CategoryModel::factory()->create([
        'name' => 'Test Category',
        'notes' => 'Test notes'
      ]);

      $category = $this->repository->findById($model->id);

      expect($category)->toBeInstanceOf(Category::class);
      expect($category->getId())->toBe($model->id);
      expect($category->getName())->toBe('Test Category');
      expect($category->getNotes())->toBe('Test notes');
    });

    it('throws exception when category not found', function () {
      expect(fn() => $this->repository->findById(999))
        ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
    });
  });

  describe('create', function () {
    it('creates new category', function () {
      $category = new Category(
        name: 'New Category',
        notes: 'New notes'
      );

      $created = $this->repository->create($category);

      expect($created)->toBeInstanceOf(Category::class);
      expect($created->getId())->not->toBeNull();
      expect($created->getName())->toBe('New Category');
      expect($created->getNotes())->toBe('New notes');

      // Verify it was saved to database
      $this->assertDatabaseHas('categories', [
        'name' => 'New Category',
        'notes' => 'New notes'
      ]);
    });

    it('throws exception when creating duplicate name', function () {
      CategoryModel::factory()->create(['name' => 'Existing Category']);

      $category = new Category(
        name: 'Existing Category',
        notes: 'Some notes'
      );

      expect(fn() => $this->repository->create($category))
        ->toThrow(CategoryAlreadyExistsException::class, "Category with name 'Existing Category' already exists");
    });
  });

  describe('update', function () {
    it('updates existing category', function () {
      $model = CategoryModel::factory()->create([
        'name' => 'Original Name',
        'notes' => 'Original notes'
      ]);

      $category = new Category(
        name: 'Updated Name',
        notes: 'Updated notes',
        id: $model->id,
        createdAt: $model->created_at
      );

      $updated = $this->repository->update($category);

      expect($updated)->toBeInstanceOf(Category::class);
      expect($updated->getId())->toBe($model->id);
      expect($updated->getName())->toBe('Updated Name');
      expect($updated->getNotes())->toBe('Updated notes');

      // Verify it was updated in database
      $this->assertDatabaseHas('categories', [
        'id' => $model->id,
        'name' => 'Updated Name',
        'notes' => 'Updated notes'
      ]);
    });

    it('throws exception when updating to duplicate name', function () {
      $model1 = CategoryModel::factory()->create(['name' => 'Category 1']);
      $model2 = CategoryModel::factory()->create(['name' => 'Category 2']);

      $category = new Category(
        name: 'Category 2', // Trying to use name from model2
        notes: 'Some notes',
        id: $model1->id,
        createdAt: $model1->created_at
      );

      expect(fn() => $this->repository->update($category))
        ->toThrow(CategoryAlreadyExistsException::class, "Category with name 'Category 2' already exists");
    });

    it('allows updating category with same name', function () {
      $model = CategoryModel::factory()->create([
        'name' => 'Same Name',
        'notes' => 'Original notes'
      ]);

      $category = new Category(
        name: 'Same Name', // Same name should be allowed
        notes: 'Updated notes',
        id: $model->id,
        createdAt: $model->created_at
      );

      $updated = $this->repository->update($category);

      expect($updated->getName())->toBe('Same Name');
      expect($updated->getNotes())->toBe('Updated notes');
    });

    it('throws exception when updating non existent category', function () {
      $category = new Category(
        name: 'Some Name',
        notes: 'Some notes',
        id: 999,
        createdAt: Carbon::now()
      );

      expect(fn() => $this->repository->update($category))
        ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
    });
  });

  describe('delete', function () {
    it('deletes category when no dependencies', function () {
      $model = CategoryModel::factory()->create();

      $this->repository->delete($model->id);

      $this->assertDatabaseMissing('categories', ['id' => $model->id]);
    });

    it('throws exception when deleting non existent category', function () {
      expect(fn() => $this->repository->delete(999))
        ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
    });
  });

  describe('existsByName', function () {
    it('detects duplicate names', function () {
      CategoryModel::factory()->create(['name' => 'Duplicate Name']);

      expect($this->repository->existsByName('Duplicate Name'))->toBeTrue();
      expect($this->repository->existsByName('Unique Name'))->toBeFalse();
    });

    it('excludes self when checking uniqueness on update', function () {
      $model = CategoryModel::factory()->create(['name' => 'Test Name']);

      // Should return false when checking the same name for the same ID (update scenario)
      expect($this->repository->existsByName('Test Name', $model->id))->toBeFalse();

      // Should return true when checking the same name for a different ID
      expect($this->repository->existsByName('Test Name', 999))->toBeTrue();
    });

    it('is case sensitive for name comparison', function () {
      CategoryModel::factory()->create(['name' => 'Test Name']);

      expect($this->repository->existsByName('Test Name'))->toBeTrue();
      expect($this->repository->existsByName('test name'))->toBeFalse();
      expect($this->repository->existsByName('TEST NAME'))->toBeFalse();
    });
  });

  describe('hasTransactions', function () {
    it('returns false for has transactions until implemented', function () {
      $model = CategoryModel::factory()->create();

      expect($this->repository->hasTransactions($model->id))->toBeFalse();
    });
  });

  describe('hasRecurringTransactions', function () {
    it('returns false for has recurring transactions until implemented', function () {
      $model = CategoryModel::factory()->create();

      expect($this->repository->hasRecurringTransactions($model->id))->toBeFalse();
    });
  });
});
