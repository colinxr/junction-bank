<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Category Model
 *
 * Represents a transaction category used to classify income and expense transactions.
 *
 * @property int $id
 * @property string $name
 * @property string $type
 * @property string|null $notes
 * @property bool $is_recurring
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Category extends Model
{
  /** @use HasFactory<\Database\Factories\CategoryFactory> */
  use HasFactory;

  /**
   * The table associated with the model.
   *
   * @var string
   */
  protected $table = 'categories';

  /**
   * The attributes that are mass assignable.
   *
   * @var list<string>
   */
  protected $fillable = [
    'name',
    'type',
    'notes',
    'is_recurring',
  ];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array
  {
    return [
      'is_recurring' => 'boolean',
      'created_at' => 'datetime',
      'updated_at' => 'datetime',
    ];
  }

  /**
   * Get all transactions for this category.
   *
   * @return HasMany
   * @todo Implement when Transactions domain is created
   */
  public function transactions() // HasMany
  {
    // Will be implemented in Transactions domain
    // return $this->hasMany('App\Models\Transaction');
  }

  /**
   * Get all recurring transactions for this category.
   *
   * @return HasMany
   * @todo Implement when RecurringTransactions domain is created
   */
  public function recurringTransactions() // HasMany
  {
    // Will be implemented in RecurringTransactions domain
    // return $this->hasMany('App\Models\RecurringTransaction');
  }
}
