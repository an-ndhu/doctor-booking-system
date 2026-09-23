import { Router } from 'express';
import * as controller from './user.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, userIdParams } from './user.validation';
import { ROLES } from '../../shared/constants';

const router = Router();
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createUserSchema), controller.createUser);
router.get('/', controller.listUsers);
router.get('/:id', validate(userIdParams, 'params'), controller.getUser);
router.put('/:id', validate(userIdParams, 'params'), validate(updateUserSchema), controller.updateUser);

export default router;
