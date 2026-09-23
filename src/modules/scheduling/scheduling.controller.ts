import type { RequestHandler } from 'express';
import * as schedulingService from './scheduling.service';
import { success, created } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const upsertSchedule: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const schedules = await schedulingService.upsertSchedule(
      req.user.clinicId,
      Number(req.params.id),
      req.body
    );
    return success(res, { schedules });
  } catch (error) {
    return next(error);
  }
};

export const createException: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const exception = await schedulingService.createException(
      req.user.clinicId,
      Number(req.params.id),
      req.body
    );
    return created(res, { exception });
  } catch (error) {
    return next(error);
  }
};

export const listExceptions: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const exceptions = await schedulingService.listExceptions(req.user.clinicId, Number(req.params.id));
    return success(res, { exceptions });
  } catch (error) {
    return next(error);
  }
};

export const deleteException: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    await schedulingService.deleteException(req.user.clinicId, Number(req.params.id));
    return success(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
};

export const getAvailability: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const date = String(req.query.date);
    const slots = await schedulingService.getAvailability(
      req.user.clinicId,
      Number(req.params.id),
      date
    );
    return success(res, { date, slots });
  } catch (error) {
    return next(error);
  }
};
