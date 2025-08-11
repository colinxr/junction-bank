import { NextResponse } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class ApiErrorHandler {
  /**
   * Creates a standardized error response following Rule 15
   * @param error - The error that occurred
   * @param defaultMessage - Fallback message for unexpected errors
   * @returns NextResponse with proper HTTP status and error format
   */
  static handle(
    error: unknown,
    defaultMessage: string = 'An unexpected error occurred'
  ): NextResponse<ApiErrorResponse> {
    console.error('API Error:', error);

    // Handle specific domain exceptions
    if (error instanceof DomainException) {
      return NextResponse.json(
        {
          error: {
            code: 'DOMAIN_ERROR',
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    // Handle "not found" exceptions (check by name since they extend DomainException)
    if (error instanceof Error && error.name.includes('NotFoundException')) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        },
        { status: 404 }
      );
    }

    // Handle validation errors (check by name)
    if (error instanceof Error && error.name.includes('ValidationException')) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        },
        { status: 422 }
      );
    }

    // Handle authentication/authorization errors
    if (error instanceof Error && error.name.includes('UnauthorizedException')) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: error.message
          }
        },
        { status: 401 }
      );
    }

    // Default case - unexpected error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: defaultMessage
        }
      },
      { status: 500 }
    );
  }

  /**
   * Creates a validation error response
   */
  static validationError(message: string): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message
        }
      },
      { status: 400 }
    );
  }

  /**
   * Creates a not found error response
   */
  static notFound(message: string): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message
        }
      },
      { status: 404 }
    );
  }

  /**
   * Creates an unauthorized error response
   */
  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message
        }
      },
      { status: 401 }
    );
  }
}
