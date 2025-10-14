<?php

declare(strict_types=1);

namespace App\Domains\Categories\Exceptions;

/**
 * Thrown when category notes exceed the maximum allowed length.
 *
 * Notes are optional but must not exceed 1000 characters when provided.
 */
final class InvalidCategoryNotesException extends CategoryException {}
