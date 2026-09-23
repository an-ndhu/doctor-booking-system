import type { RequestHandler } from 'express';
import * as clinicService from './clinic.service';
import { success } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const getClinic: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const clinic = await clinicService.getClinic(req.user.clinicId);
    return success(res, { clinic });
  } catch (error) {
    return next(error);
  }
};

export const updateTimezone: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const clinic = await clinicService.updateTimezone(req.user.clinicId, req.body.timezone);
    return success(res, { clinic });
  } catch (error) {
    return next(error);
  }
};
