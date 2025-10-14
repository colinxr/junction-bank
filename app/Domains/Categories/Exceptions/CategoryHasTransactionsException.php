<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Thrown when attempting to delete a category that has associated transactions.
 *
 * Categories cannot be deleted if they have any associated transactions
 * or recurring transactions to maintain referential integrity.
 */
final class CategoryHasTransactionsException extends CategoryException {}
