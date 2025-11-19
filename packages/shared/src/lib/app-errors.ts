/**
 * Base application error class with HTTP status code support.
 * All custom application errors should extend this class.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Error thrown when a requested resource is not found.
 * HTTP Status: 404
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number,
    details?: Record<string, unknown>,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Error thrown when user is not authenticated.
 * HTTP Status: 401
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 'UNAUTHORIZED', 401, details);
  }
}

/**
 * Error thrown when user lacks required permissions.
 * HTTP Status: 403
 */
export class ForbiddenError extends AppError {
  constructor(
    action: string,
    resource?: string,
    details?: Record<string, unknown>,
  ) {
    const message = resource
      ? `You do not have permission to ${action} ${resource}`
      : `You do not have permission to ${action}`;

    super(message, 'FORBIDDEN', 403, details);
  }
}

/**
 * Error thrown when input validation fails.
 * HTTP Status: 400
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
    details?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', 400, {
      ...details,
      fieldErrors,
    });
  }

  static fromZodError(error: { errors: Array<{ path: (string | number)[]; message: string }> }) {
    const fieldErrors: Record<string, string[]> = {};

    for (const err of error.errors) {
      const path = err.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(err.message);
    }

    return new ValidationError('Validation failed', fieldErrors);
  }
}

/**
 * Error thrown when a business rule is violated.
 * HTTP Status: 422
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details);
  }
}

/**
 * Error thrown when a conflict occurs (e.g., duplicate resource).
 * HTTP Status: 409
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is a NotFoundError
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Type guard to check if an error is an UnauthorizedError
 */
export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

/**
 * Type guard to check if an error is a ForbiddenError
 */
export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is a BusinessRuleError
 */
export function isBusinessRuleError(error: unknown): error is BusinessRuleError {
  return error instanceof BusinessRuleError;
}

/**
 * Type guard to check if an error is a ConflictError
 */
export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}
