<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
  /**
   * The name of the factory's corresponding model.
   *
   * @var class-string<\Illuminate\Database\Eloquent\Model>
   */
  protected $model = Category::class;

  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'name' => $this->faker->words(2, true),
      'notes' => $this->faker->optional(0.7)->sentence(),
    ];
  }

  /**
   * Indicate that the category has no notes.
   */
  public function withoutNotes(): static
  {
    return $this->state(fn(array $attributes) => [
      'notes' => null,
    ]);
  }

  /**
   * Indicate that the category has specific name.
   */
  public function withName(string $name): static
  {
    return $this->state(fn(array $attributes) => [
      'name' => $name,
    ]);
  }
}
