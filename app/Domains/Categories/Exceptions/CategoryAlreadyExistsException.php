<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Thrown when attempting to create a category with a name that already exists.
 *
 * Category names must be unique within the system.
 */
final class CategoryAlreadyExistsException extends CategoryException {}
