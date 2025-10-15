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
    it('returns paginated categories with correct structure', function () {
      // Arrange
      CategoryModel::factory()->count(25)->create();

      // Act
      $result = $this->repository->findAll(1, 10);

      // Assert - Pagination structure
      expect($result)
        ->toHaveKey('data')
        ->and($result)->toHaveKey('pagination')
        ->and($result['data'])->toHaveCount(10)
        ->and($result['pagination']['currentPage'])->toBe(1)
        ->and($result['pagination']['totalPages'])->toBe(3)
        ->and($result['pagination']['totalItems'])->toBe(25)
        ->and($result['pagination']['itemsPerPage'])->toBe(10);

      // Assert - All items are Category entities
      foreach ($result['data'] as $category) {
        expect($category)->toBeInstanceOf(Category::class);
      }
    });
  });

  describe('findById', function () {
    it('returns category entity when category exists', function () {
      // Arrange
      $model = CategoryModel::factory()->create([
        'name' => 'Test Category',
        'notes' => 'Test notes'
      ]);

      // Act
      $category = $this->repository->findById($model->id);

      // Assert
      expect($category)
        ->toBeInstanceOf(Category::class)
        ->and($category->getId())->toBe($model->id)
        ->and($category->getName())->toBe('Test Category')
        ->and($category->getNotes())->toBe('Test notes');
    });

    it('throws exception when category does not exist', function () {
      // Act & Assert
      expect(fn() => $this->repository->findById(999))
        ->toThrow(CategoryNotFoundException::class, 'Category with ID 999 not found');
    });
  });

  describe('create', function () {
    it('creates new category with valid data', function () {
      // Arrange
      $category = new Category(
        name: 'New Category',
        notes: 'New notes'
      );

      // Act
      $created = $this->repository->create($category);

      // Assert - Entity properties
      expect($created)
        ->toBeInstanceOf(Category::class)
        ->and($created->getId())->not->toBeNull()
        ->and($created->getName())->toBe('New Category')
        ->and($created->getNotes())->toBe('New notes');

      // Assert - Database state
      $this->assertDatabaseHas('categories', [
        'name' => 'New Category',
        'notes' => 'New notes'
      ]);
    });

    it('throws exception when creating category with duplicate name', function () {
      // Arrange
      CategoryModel::factory()->create(['name' => 'Existing Category']);

      $category = new Category(
        name: 'Existing Category',
        notes: 'Some notes'
      );

      // Act & Assert
      expect(fn() => $this->repository->create($category))
        ->toThrow(CategoryAlreadyExistsException::class, "Category with name 'Existing Category' already exists");
    });
  });

  describe('update', function () {
    it('updates existing category with new data', function () {
      // Arrange
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

      // Act
      $updated = $this->repository->update($category);

      // Assert - Entity properties
      expect($updated)
        ->toBeInstanceOf(Category::class)
        ->and($updated->getId())->toBe($model->id)
        ->and($updated->getName())->toBe('Updated Name')
        ->and($updated->getNotes())->toBe('Updated notes');

      // Assert - Database state
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
