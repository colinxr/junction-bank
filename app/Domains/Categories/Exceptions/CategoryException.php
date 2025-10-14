<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Base exception for all category-related domain errors.
 *
 * All category exceptions should extend this class to allow
 * for consistent exception handling at the domain boundary.
 */
abstract class CategoryException extends \Exception {}
