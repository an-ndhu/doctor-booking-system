import { Router } from 'express';
import * as controller from './doctor.controller';
import * as schedulingController from '../scheduling/scheduling.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createDoctorSchema, updateDoctorSchema, doctorIdParams } from './doctor.validation';
import {
  scheduleSchema,
  exceptionSchema,
  doctorIdParams as schedulingDoctorParams,
  availabilityQuerySchema,
} from '../scheduling/scheduling.validation';
import { ROLES } from '../../shared/constants';

const adminRouter = Router();
adminRouter.use(authenticate, authorize(ROLES.ADMIN));

adminRouter.post('/', validate(createDoctorSchema), controller.createDoctor);
adminRouter.get('/', controller.listAdminDoctors);
adminRouter.get('/:id', validate(doctorIdParams, 'params'), controller.getAdminDoctor);
adminRouter.put('/:id', validate(doctorIdParams, 'params'), validate(updateDoctorSchema), controller.updateDoctor);
adminRouter.delete('/:id', validate(doctorIdParams, 'params'), controller.deactivateDoctor);
adminRouter.put(
  '/:id/schedule',
  validate(schedulingDoctorParams, 'params'),
  validate(scheduleSchema),
  schedulingController.upsertSchedule
);
adminRouter.post(
  '/:id/exceptions',
  validate(schedulingDoctorParams, 'params'),
  validate(exceptionSchema),
  schedulingController.createException
);
adminRouter.get(
  '/:id/exceptions',
  validate(schedulingDoctorParams, 'params'),
  schedulingController.listExceptions
);

const publicRouter = Router();
publicRouter.use(authenticate);
publicRouter.get('/', controller.listPublicDoctors);
publicRouter.get(
  '/:id/availability',
  validate(doctorIdParams, 'params'),
  validate(availabilityQuerySchema, 'query'),
  schedulingController.getAvailability
);
publicRouter.get('/:id', validate(doctorIdParams, 'params'), controller.getPublicDoctor);

export { adminRouter, publicRouter };
