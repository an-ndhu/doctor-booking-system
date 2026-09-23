import type { ErrorCode, FieldError } from '../constants';

export class AppError extends Error {
  statusCode: number;
  code: ErrorCode | string;
  details?: unknown;
  errors?: FieldError[];

  constructor(message: string, statusCode: number, code: ErrorCode | string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors: FieldError[] = []) {
    super(message, 400, 'VALIDATION_ERROR', errors);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', code: ErrorCode | string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, errors: FieldError[] = []) {
    super(message, 422, 'VALIDATION_ERROR', errors);
    this.errors = errors;
  }
}
