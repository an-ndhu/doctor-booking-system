import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AuthenticationError } from '../shared/errors';
import { findById } from '../modules/users/user.repository';
import type { Role } from '../shared/constants';

interface AccessTokenPayload {
  sub: string;
  role: Role;
  clinicId: number;
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authentication token');
    }

    const token = header.slice(7);
    let payload: AccessTokenPayload;
    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      if (typeof decoded === 'string' || !decoded.sub) {
        throw new AuthenticationError('Invalid or expired authentication token');
      }
      payload = decoded as AccessTokenPayload;
    } catch (_err) {
      throw new AuthenticationError('Invalid or expired authentication token');
    }

    const user = await findById(payload.sub);
    if (!user) {
      throw new AuthenticationError('Invalid or expired authentication token');
    }

    req.user = {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export function requireUser(req: Request): asserts req is Request & { user: NonNullable<Request['user']> } {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }
}
