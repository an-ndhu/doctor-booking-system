import type { NextFunction, Request, Response } from 'express';
import { UniqueConstraintError, ValidationError as SequelizeValidationError, DatabaseError } from 'sequelize';
import { AppError } from '../shared/errors';
import env from '../config/env';
import type { FieldError } from '../shared/constants';

function isExclusionViolation(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    Boolean((error.original as { code?: string } | undefined)?.code === '23P01')
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): Response {
  if (err instanceof AppError) {
    const body: {
      success: false;
      message: string;
      code: string;
      errors?: FieldError[];
    } = {
      success: false,
      message: err.message,
      code: err.code,
    };
    if (err.errors) {
      body.errors = err.errors;
    }
    return res.status(err.statusCode).json(body);
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      code: 'CONFLICT',
    });
  }

  if (isExclusionViolation(err)) {
    return res.status(409).json({
      success: false,
      message: 'Appointment slot is no longer available',
      code: 'APPOINTMENT_CONFLICT',
    });
  }

  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map((item) => ({
        field: item.path ?? 'unknown',
        message: item.message,
      })),
    });
  }

  const error = err as { message?: string; stack?: string };
  const payload: {
    success: false;
    message: string;
    code: string;
    stack?: string;
  } = {
    success: false,
    message: env.isProduction ? 'Unexpected error' : error.message || 'Unexpected error',
    code: 'INTERNAL_ERROR',
  };

  if (!env.isProduction) {
    payload.stack = error.stack;
  }

  return res.status(500).json(payload);
}
