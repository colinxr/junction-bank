<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Thrown when a requested category cannot be found.
 *
 * This exception is typically thrown by repository implementations
 * when attempting to retrieve a non-existent category.
 */
final class CategoryNotFoundException extends CategoryException {}
