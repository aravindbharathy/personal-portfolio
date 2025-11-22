import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Handle different types of errors and return appropriate response
 */
export function handleError(error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
} {
  // App errors (custom errors)
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error instanceof ValidationError ? error.details : undefined,
    };
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        message: `A record with this ${field} already exists`,
        statusCode: 409,
        code: 'DUPLICATE_RESOURCE',
      };
    }

    // Record not found
    if (error.code === 'P2025') {
      return {
        message: 'Record not found',
        statusCode: 404,
        code: 'NOT_FOUND',
      };
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      return {
        message: 'Invalid reference to related record',
        statusCode: 400,
        code: 'INVALID_REFERENCE',
      };
    }
  }

  // Generic error
  console.error('Unhandled error:', error);
  return {
    message: 'Internal server error',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
  };
}
