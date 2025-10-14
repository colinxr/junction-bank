<?php

declare(strict_types=1);

namespace App\Domains\Categories\Entities;

use App\Domains\Categories\Exceptions\InvalidCategoryNameException;
use App\Domains\Categories\Exceptions\InvalidCategoryNotesException;
use DateTimeInterface;

/**
 * Category domain entity.
 *
 * Represents a transaction category with business rules and validation.
 * This is a pure domain entity with no infrastructure dependencies.
 */
final class Category
{
  private const MAX_NAME_LENGTH = 255;
  private const MAX_NOTES_LENGTH = 1000;

  private ?int $id;
  private string $name;
  private ?string $notes;
  private ?DateTimeInterface $createdAt;

  /**
   * Create a new Category entity.
   *
   * @param string $name Category name (will be trimmed)
   * @param string|null $notes Optional notes
   * @param int|null $id Entity ID (null for new entities)
   * @param DateTimeInterface|null $createdAt Creation timestamp (null for new entities)
   *
   * @throws InvalidCategoryNameException If name is empty or exceeds 255 characters
   * @throws InvalidCategoryNotesException If notes exceed 1000 characters
   */
  public function __construct(
    string $name,
    ?string $notes = null,
    ?int $id = null,
    ?DateTimeInterface $createdAt = null
  ) {
    $this->name = trim($name);
    $this->notes = $notes;
    $this->id = $id;
    $this->createdAt = $createdAt;

    $this->validate();
  }

  /**
   * Validate entity state.
   *
   * @throws InvalidCategoryNameException If name is invalid
   * @throws InvalidCategoryNotesException If notes are invalid
   */
  private function validate(): void
  {
    if (empty($this->name)) {
      throw new InvalidCategoryNameException('Category name cannot be empty');
    }

    if (strlen($this->name) > self::MAX_NAME_LENGTH) {
      throw new InvalidCategoryNameException(
        sprintf('Category name cannot exceed %d characters', self::MAX_NAME_LENGTH)
      );
    }

    if ($this->notes !== null && strlen($this->notes) > self::MAX_NOTES_LENGTH) {
      throw new InvalidCategoryNotesException(
        sprintf('Category notes cannot exceed %d characters', self::MAX_NOTES_LENGTH)
      );
    }
  }

  /**
   * Get the entity ID.
   *
   * @return int|null ID if persisted, null for new entities
   */
  public function getId(): ?int
  {
    return $this->id;
  }

  /**
   * Get the category name.
   *
   * @return string Category name
   */
  public function getName(): string
  {
    return $this->name;
  }

  /**
   * Get the category notes.
   *
   * @return string|null Notes if set, null otherwise
   */
  public function getNotes(): ?string
  {
    return $this->notes;
  }

  /**
   * Get the creation timestamp.
   *
   * @return DateTimeInterface|null Creation timestamp if persisted, null otherwise
   */
  public function getCreatedAt(): ?DateTimeInterface
  {
    return $this->createdAt;
  }

  /**
   * Update the category name.
   *
   * @param string $newName New name (will be trimmed)
   *
   * @throws InvalidCategoryNameException If new name is invalid
   */
  public function updateName(string $newName): void
  {
    $this->name = trim($newName);
    $this->validate();
  }

  /**
   * Update the category notes.
   *
   * @param string|null $newNotes New notes or null to clear
   *
   * @throws InvalidCategoryNotesException If new notes are invalid
   */
  public function updateNotes(?string $newNotes): void
  {
    $this->notes = $newNotes;
    $this->validate();
  }
}
