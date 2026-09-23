import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema } from './auth.validation';
import env from '../../config/env';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Try again later.',
    code: 'RATE_LIMITED',
  },
});

const registerGuards = env.isTest
  ? [validate(registerSchema)]
  : [authLimiter, validate(registerSchema)];
const loginGuards = env.isTest ? [validate(loginSchema)] : [authLimiter, validate(loginSchema)];

router.post('/register', ...registerGuards, controller.register);
router.post('/login', ...loginGuards, controller.login);
router.get('/me', authenticate, controller.me);

export default router;
