import type { NextFunction, Request, Response } from 'express';
import { AuthorizationError } from '../shared/errors';
import type { Role } from '../shared/constants';

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AuthorizationError('Insufficient permissions'));
      return;
    }
    next();
  };
}
