import type { RequestHandler } from 'express';
import * as appointmentService from './appointment.service';
import { success, created } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const book: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const appointment = await appointmentService.book(req.user, req.body);
    return created(res, { appointment });
  } catch (error) {
    return next(error);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const appointments = await appointmentService.list(req.user);
    return success(res, { appointments });
  } catch (error) {
    return next(error);
  }
};

export const getById: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const appointment = await appointmentService.getById(req.user, Number(req.params.id));
    return success(res, { appointment });
  } catch (error) {
    return next(error);
  }
};
