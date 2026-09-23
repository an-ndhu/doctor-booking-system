import { Router } from 'express';
import * as controller from './scheduling.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { exceptionIdParams } from './scheduling.validation';
import { ROLES } from '../../shared/constants';

const router = Router();
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(exceptionIdParams, 'params'),
  controller.deleteException
);

export default router;
