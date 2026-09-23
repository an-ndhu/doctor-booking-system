import { Router } from 'express';
import * as controller from './appointment.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createAppointmentSchema, appointmentIdParams } from './appointment.validation';

const router = Router();
router.use(authenticate);
router.post('/', validate(createAppointmentSchema), controller.book);
router.get('/', controller.list);
router.get('/:id', validate(appointmentIdParams, 'params'), controller.getById);

export default router;
