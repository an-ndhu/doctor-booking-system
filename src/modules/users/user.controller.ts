import type { RequestHandler } from 'express';
import * as userService from './user.service';
import { success, created } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const listUsers: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const users = await userService.listUsers(req.user.clinicId);
    return success(res, { users });
  } catch (error) {
    return next(error);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const user = await userService.getUser(req.user.clinicId, Number(req.params.id));
    return success(res, { user });
  } catch (error) {
    return next(error);
  }
};

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const user = await userService.createUser(req.user.clinicId, req.body);
    return created(res, { user });
  } catch (error) {
    return next(error);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const user = await userService.updateUser(
      req.user.clinicId,
      Number(req.params.id),
      req.user.id,
      req.body
    );
    return success(res, { user });
  } catch (error) {
    return next(error);
  }
};
