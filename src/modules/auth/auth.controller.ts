import type { RequestHandler } from 'express';
import * as authService from './auth.service';
import { created, success } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const register: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return created(res, result);
  } catch (error) {
    return next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (error) {
    return next(error);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const user = await authService.me(req.user.id);
    return success(res, { user });
  } catch (error) {
    return next(error);
  }
};
