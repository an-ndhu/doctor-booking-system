import type { RequestHandler } from 'express';
import * as doctorService from './doctor.service';
import { success, created } from '../../shared/responses';
import { requireUser } from '../../middleware/authenticate';

export const createDoctor: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctor = await doctorService.createDoctor(req.user.clinicId, req.body);
    return created(res, { doctor });
  } catch (error) {
    return next(error);
  }
};

export const listAdminDoctors: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctors = await doctorService.listDoctors(req.user.clinicId, { includeInactive: true });
    return success(res, { doctors });
  } catch (error) {
    return next(error);
  }
};

export const getAdminDoctor: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctor = await doctorService.getDoctor(req.user.clinicId, Number(req.params.id));
    return success(res, { doctor });
  } catch (error) {
    return next(error);
  }
};

export const updateDoctor: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctor = await doctorService.updateDoctor(req.user.clinicId, Number(req.params.id), req.body);
    return success(res, { doctor });
  } catch (error) {
    return next(error);
  }
};

export const deactivateDoctor: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctor = await doctorService.deactivateDoctor(req.user.clinicId, Number(req.params.id));
    return success(res, { doctor });
  } catch (error) {
    return next(error);
  }
};

export const listPublicDoctors: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctors = await doctorService.listDoctors(req.user.clinicId, { includeInactive: false });
    return success(res, { doctors });
  } catch (error) {
    return next(error);
  }
};

export const getPublicDoctor: RequestHandler = async (req, res, next) => {
  try {
    requireUser(req);
    const doctor = await doctorService.getDoctor(req.user.clinicId, Number(req.params.id), {
      requireActive: true,
    });
    return success(res, { doctor });
  } catch (error) {
    return next(error);
  }
};
