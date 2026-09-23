import { Router } from 'express';
import * as controller from './clinic.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { timezoneSchema } from './clinic.validation';
import { ROLES } from '../../shared/constants';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/', controller.getClinic);
router.put('/timezone', validate(timezoneSchema), controller.updateTimezone);

export default router;
