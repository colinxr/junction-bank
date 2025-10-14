<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Thrown when a category name is invalid.
 *
 * This includes:
 * - Empty or whitespace-only names
 * - Names exceeding 500 characters
 */
final class InvalidCategoryNameException extends CategoryException {}
