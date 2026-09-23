import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import { ValidationError } from '../shared/errors';

type RequestProperty = 'body' | 'params' | 'query';

export function validate(schema: ObjectSchema, property: RequestProperty = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.') || property,
        message: detail.message.replace(/['"]/g, ''),
      }));
      next(new ValidationError('Validation failed', errors));
      return;
    }

    req[property] = value;
    next();
  };
}
