import { describe, it, expect } from 'vitest';
import { ApiErrorHandler } from './api-error-handler';
import { DomainException } from '@/domains/Shared/DomainException';

// Mock exception classes for testing
class TestNotFoundException extends DomainException {
  constructor() {
    super('Test not found');
    this.name = 'TestNotFoundException';
  }
}

class TestValidationException extends DomainException {
  constructor() {
    super('Test validation error');
    this.name = 'TestValidationException';
  }
}

class TestUnauthorizedException extends DomainException {
  constructor() {
    super('Test unauthorized');
    this.name = 'TestUnauthorizedException';
  }
}

describe('ApiErrorHandler', () => {
  describe('handle', () => {
    it('handles DomainException with 400 status', async () => {
      const error = new DomainException('Test domain error');
      const response = ApiErrorHandler.handle(error);
      
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'DOMAIN_ERROR',
          message: 'Test domain error'
        }
      });
    });

    it('handles NotFoundException with 404 status', async () => {
      const error = new TestNotFoundException();
      const response = ApiErrorHandler.handle(error);
      
      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Test not found'
        }
      });
    });

    it('handles ValidationException with 422 status', async () => {
      const error = new TestValidationException();
      const response = ApiErrorHandler.handle(error);
      
      expect(response.status).toBe(422);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Test validation error'
        }
      });
    });

    it('handles UnauthorizedException with 401 status', async () => {
      const error = new TestUnauthorizedException();
      const response = ApiErrorHandler.handle(error);
      
      expect(response.status).toBe(401);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Test unauthorized'
        }
      });
    });

    it('handles unknown errors with 500 status and default message', async () => {
      const error = new Error('Unknown error');
      const response = ApiErrorHandler.handle(error);
      
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    });

    it('handles unknown errors with custom default message', async () => {
      const error = new Error('Unknown error');
      const response = ApiErrorHandler.handle(error, 'Custom error message');
      
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Custom error message'
        }
      });
    });
  });

  describe('validationError', () => {
    it('creates validation error response with 400 status', async () => {
      const response = ApiErrorHandler.validationError('Validation failed');
      
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed'
        }
      });
    });
  });

  describe('notFound', () => {
    it('creates not found error response with 404 status', async () => {
      const response = ApiErrorHandler.notFound('Resource not found');
      
      expect(response.status).toBe(404);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found'
        }
      });
    });
  });

  describe('unauthorized', () => {
    it('creates unauthorized error response with 401 status and default message', async () => {
      const response = ApiErrorHandler.unauthorized();
      
      expect(response.status).toBe(401);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized'
        }
      });
    });

    it('creates unauthorized error response with custom message', async () => {
      const response = ApiErrorHandler.unauthorized('Custom unauthorized message');
      
      expect(response.status).toBe(401);
      const responseData = await response.json();
      expect(responseData).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Custom unauthorized message'
        }
      });
    });
  });
});
