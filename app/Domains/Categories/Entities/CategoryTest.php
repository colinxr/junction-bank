<?php

declare(strict_types=1);

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\InvalidCategoryNameException;
use App\Domains\Categories\Exceptions\InvalidCategoryNotesException;

describe('Category Entity Business Rules', function () {
  describe('Name Validation', function () {
    it('rejects empty names', function () {
      expect(fn() => new Category(''))
        ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
    });

    it('rejects whitespace-only names', function () {
      expect(fn() => new Category('   '))
        ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
    });

    it('trims whitespace before validation', function () {
      $category = new Category('  Groceries  ');
      expect($category->getName())->toBe('Groceries');
    });

    it('truncates names exceeding 255 characters', function () {
      $longName = str_repeat('a', 300);
      $category = new Category($longName);

      expect($category->getName())->toBe(str_repeat('a', 255))
        ->and(strlen($category->getName()))->toBe(255);
    });

    it('truncates after trimming whitespace', function () {
      $longName = '   ' . str_repeat('a', 300);
      $category = new Category($longName);

      expect($category->getName())->toBe(str_repeat('a', 255))
        ->and(strlen($category->getName()))->toBe(255);
    });

    it('accepts names at exactly 255 characters', function () {
      $maxName = str_repeat('a', 255);
      $category = new Category($maxName);

      expect($category->getName())->toBe($maxName)
        ->and(strlen($category->getName()))->toBe(255);
    });

    it('rejects names that become empty after trimming', function () {
      expect(fn() => new Category("\t\n  \t"))
        ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
    });
  });

  describe('Notes Validation', function () {
    it('accepts null notes', function () {
      $category = new Category('Groceries', null);
      expect($category->getNotes())->toBeNull();
    });

    it('accepts empty string notes', function () {
      $category = new Category('Groceries', '');
      expect($category->getNotes())->toBe('');
    });

    it('rejects notes exceeding 1000 characters', function () {
      $longNotes = str_repeat('a', 1001);

      expect(fn() => new Category('Groceries', $longNotes))
        ->toThrow(InvalidCategoryNotesException::class, 'Category notes cannot exceed 1000 characters');
    });

    it('accepts notes at exactly 1000 characters', function () {
      $maxNotes = str_repeat('a', 1000);
      $category = new Category('Groceries', $maxNotes);

      expect($category->getNotes())->toBe($maxNotes)
        ->and(strlen($category->getNotes()))->toBe(1000);
    });
  });

  describe('Entity Construction', function () {
    it('creates entity with required fields only', function () {
      $category = new Category('Groceries');

      expect($category->getName())->toBe('Groceries')
        ->and($category->getNotes())->toBeNull()
        ->and($category->getId())->toBeNull()
        ->and($category->getCreatedAt())->toBeNull();
    });

    it('creates entity with all fields', function () {
      $createdAt = new DateTimeImmutable('2025-01-01 12:00:00');
      $category = new Category(
        name: 'Groceries',
        notes: 'Weekly grocery shopping',
        id: 42,
        createdAt: $createdAt
      );

      expect($category->getName())->toBe('Groceries')
        ->and($category->getNotes())->toBe('Weekly grocery shopping')
        ->and($category->getId())->toBe(42)
        ->and($category->getCreatedAt())->toBe($createdAt);
    });
  });

  describe('Business Methods', function () {
    describe('updateName', function () {
      it('updates name with validation', function () {
        $category = new Category('Groceries');
        $category->updateName('Food & Groceries');

        expect($category->getName())->toBe('Food & Groceries');
      });

      it('trims whitespace when updating', function () {
        $category = new Category('Groceries');
        $category->updateName('  Food & Groceries  ');

        expect($category->getName())->toBe('Food & Groceries');
      });

      it('validates new name on update', function () {
        $category = new Category('Groceries');

        expect(fn() => $category->updateName(''))
          ->toThrow(InvalidCategoryNameException::class);
      });

      it('truncates long names on update', function () {
        $category = new Category('Groceries');
        $longName = str_repeat('b', 300);

        $category->updateName($longName);

        expect($category->getName())->toBe(str_repeat('b', 255))
          ->and(strlen($category->getName()))->toBe(255);
      });
    });

    describe('updateNotes', function () {
      it('updates notes with validation', function () {
        $category = new Category('Groceries', 'Old notes');
        $category->updateNotes('New notes');

        expect($category->getNotes())->toBe('New notes');
      });

      it('updates notes to null', function () {
        $category = new Category('Groceries', 'Some notes');
        $category->updateNotes(null);

        expect($category->getNotes())->toBeNull();
      });

      it('updates null notes to string', function () {
        $category = new Category('Groceries', null);
        $category->updateNotes('New notes');

        expect($category->getNotes())->toBe('New notes');
      });

      it('validates new notes on update', function () {
        $category = new Category('Groceries');
        $longNotes = str_repeat('a', 1001);

        expect(fn() => $category->updateNotes($longNotes))
          ->toThrow(InvalidCategoryNotesException::class);
      });
    });
  });
});
