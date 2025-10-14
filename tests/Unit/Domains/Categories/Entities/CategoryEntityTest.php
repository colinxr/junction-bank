<?php

declare(strict_types=1);

use App\Domains\Categories\Entities\Category;
use App\Domains\Categories\Exceptions\InvalidCategoryNameException;
use App\Domains\Categories\Exceptions\InvalidCategoryNotesException;

describe('Category Entity Constructor', function () {
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

  it('validates immediately on construction', function () {
    expect(fn() => new Category(''))
      ->toThrow(InvalidCategoryNameException::class);
  });

  it('trims whitespace from name during construction', function () {
    $category = new Category('  Groceries  ');

    expect($category->getName())->toBe('Groceries');
  });
});

describe('Category Entity Name Validation', function () {
  it('throws exception when name is empty string', function () {
    expect(fn() => new Category(''))
      ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
  });

  it('throws exception when name is whitespace-only', function () {
    expect(fn() => new Category('   '))
      ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
  });

  it('throws exception when name is tabs and spaces', function () {
    expect(fn() => new Category("\t\n  \t"))
      ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
  });

  it('truncates name when it exceeds 255 characters', function () {
    $longName = str_repeat('a', 300);
    $category = new Category($longName);

    expect($category->getName())->toBe(str_repeat('a', 255))
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('accepts name at exactly 255 characters', function () {
    $maxName = str_repeat('a', 255);
    $category = new Category($maxName);

    expect($category->getName())->toBe($maxName)
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('accepts valid name with unicode characters', function () {
    $category = new Category('🏠 Housing & Utilities');

    expect($category->getName())->toBe('🏠 Housing & Utilities');
  });

  it('accepts valid name with special characters', function () {
    $category = new Category('Food & Drink (Restaurants)');

    expect($category->getName())->toBe('Food & Drink (Restaurants)');
  });

  it('accepts single character name', function () {
    $category = new Category('A');

    expect($category->getName())->toBe('A');
  });
});

describe('Category Entity Notes Validation', function () {
  it('accepts null notes', function () {
    $category = new Category('Groceries', null);

    expect($category->getNotes())->toBeNull();
  });

  it('accepts valid notes', function () {
    $category = new Category('Groceries', 'Weekly shopping at local store');

    expect($category->getNotes())->toBe('Weekly shopping at local store');
  });

  it('accepts empty string notes', function () {
    $category = new Category('Groceries', '');

    expect($category->getNotes())->toBe('');
  });

  it('accepts notes at exactly 1000 characters', function () {
    $maxNotes = str_repeat('a', 1000);
    $category = new Category('Groceries', $maxNotes);

    expect($category->getNotes())->toBe($maxNotes)
      ->and(strlen($category->getNotes()))->toBe(1000);
  });

  it('throws exception when notes exceed 1000 characters', function () {
    $longNotes = str_repeat('a', 1001);

    expect(fn() => new Category('Groceries', $longNotes))
      ->toThrow(InvalidCategoryNotesException::class, 'Category notes cannot exceed 1000 characters');
  });

  it('handles special characters in notes', function () {
    $notes = 'Special chars: @#$%^&*()_+-=[]{}|;:",.<>?/~`';
    $category = new Category('Groceries', $notes);

    expect($category->getNotes())->toBe($notes);
  });

  it('handles unicode in notes', function () {
    $notes = 'Unicode test: 日本語 ñáéíóú 🎉';
    $category = new Category('Groceries', $notes);

    expect($category->getNotes())->toBe($notes);
  });

  it('handles multiline notes', function () {
    $notes = "Line 1\nLine 2\nLine 3";
    $category = new Category('Groceries', $notes);

    expect($category->getNotes())->toBe($notes);
  });
});

describe('Category Entity Business Methods - updateName', function () {
  it('updates name successfully', function () {
    $category = new Category('Groceries');
    $category->updateName('Food & Groceries');

    expect($category->getName())->toBe('Food & Groceries');
  });

  it('trims whitespace when updating name', function () {
    $category = new Category('Groceries');
    $category->updateName('  Food & Groceries  ');

    expect($category->getName())->toBe('Food & Groceries');
  });

  it('validates new name on update', function () {
    $category = new Category('Groceries');

    expect(fn() => $category->updateName(''))
      ->toThrow(InvalidCategoryNameException::class);
  });

  it('throws exception when updating to whitespace-only name', function () {
    $category = new Category('Groceries');

    expect(fn() => $category->updateName('   '))
      ->toThrow(InvalidCategoryNameException::class, 'Category name cannot be empty');
  });

  it('truncates name when updating to name exceeding 255 characters', function () {
    $category = new Category('Groceries');
    $longName = str_repeat('b', 300);

    $category->updateName($longName);

    expect($category->getName())->toBe(str_repeat('b', 255))
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('allows updating to name at exactly 255 characters', function () {
    $category = new Category('Groceries');
    $maxName = str_repeat('b', 255);

    $category->updateName($maxName);

    expect($category->getName())->toBe($maxName);
  });
});

describe('Category Entity Business Methods - updateNotes', function () {
  it('updates notes successfully', function () {
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

  it('allows updating to notes at exactly 1000 characters', function () {
    $category = new Category('Groceries');
    $maxNotes = str_repeat('b', 1000);

    $category->updateNotes($maxNotes);

    expect($category->getNotes())->toBe($maxNotes);
  });

  it('allows updating to empty string notes', function () {
    $category = new Category('Groceries', 'Some notes');
    $category->updateNotes('');

    expect($category->getNotes())->toBe('');
  });
});

describe('Category Entity Getters', function () {
  it('returns correct id when set', function () {
    $category = new Category('Groceries', null, 123);

    expect($category->getId())->toBe(123);
  });

  it('returns null id for new entity', function () {
    $category = new Category('Groceries');

    expect($category->getId())->toBeNull();
  });

  it('returns correct name', function () {
    $category = new Category('Groceries');

    expect($category->getName())->toBe('Groceries');
  });

  it('returns correct notes when set', function () {
    $category = new Category('Groceries', 'Some notes');

    expect($category->getNotes())->toBe('Some notes');
  });

  it('returns null notes when not set', function () {
    $category = new Category('Groceries');

    expect($category->getNotes())->toBeNull();
  });

  it('returns correct createdAt when set', function () {
    $createdAt = new DateTimeImmutable('2025-01-01 12:00:00');
    $category = new Category('Groceries', null, null, $createdAt);

    expect($category->getCreatedAt())->toBe($createdAt);
  });

  it('returns null createdAt for new entity', function () {
    $category = new Category('Groceries');

    expect($category->getCreatedAt())->toBeNull();
  });

  it('preserves DateTimeInterface type', function () {
    $createdAt = new DateTime('2025-01-01 12:00:00');
    $category = new Category('Groceries', null, null, $createdAt);

    expect($category->getCreatedAt())->toBeInstanceOf(DateTimeInterface::class);
  });
});

describe('Category Entity Edge Cases', function () {
  it('handles name with leading whitespace only', function () {
    $category = new Category('   Groceries');

    expect($category->getName())->toBe('Groceries');
  });

  it('handles name with trailing whitespace only', function () {
    $category = new Category('Groceries   ');

    expect($category->getName())->toBe('Groceries');
  });

  it('handles name with both leading and trailing whitespace', function () {
    $category = new Category('   Groceries   ');

    expect($category->getName())->toBe('Groceries');
  });

  it('handles name with internal whitespace', function () {
    $category = new Category('Food  &  Groceries');

    expect($category->getName())->toBe('Food  &  Groceries');
  });

  it('handles name with mixed unicode and ascii', function () {
    $category = new Category('Café ☕ & Restaurant');

    expect($category->getName())->toBe('Café ☕ & Restaurant');
  });

  it('truncates unicode names correctly', function () {
    $unicodeName = '🏠' . str_repeat('a', 300) . '🏠'; // 302 chars total
    $category = new Category($unicodeName);

    expect(strlen($category->getName()))->toBeLessThanOrEqual(255);
  });

  it('truncates name with leading whitespace correctly', function () {
    $longName = '   ' . str_repeat('a', 300);
    $category = new Category($longName);

    expect($category->getName())->toBe(str_repeat('a', 255))
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('truncates name with trailing whitespace correctly', function () {
    $longName = str_repeat('a', 300) . '   ';
    $category = new Category($longName);

    expect($category->getName())->toBe(str_repeat('a', 255))
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('truncates name with both leading and trailing whitespace correctly', function () {
    $longName = '   ' . str_repeat('a', 300) . '   ';
    $category = new Category($longName);

    expect($category->getName())->toBe(str_repeat('a', 255))
      ->and(strlen($category->getName()))->toBe(255);
  });

  it('preserves internal structure of notes', function () {
    $notes = "  Internal  spacing  preserved  ";
    $category = new Category('Groceries', $notes);

    expect($category->getNotes())->toBe($notes);
  });
});
