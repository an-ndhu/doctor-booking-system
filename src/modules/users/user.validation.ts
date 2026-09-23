import Joi from 'joi';
import { ROLES } from '../../shared/constants';

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(72).required(),
  role: Joi.string().valid(ROLES.USER, ROLES.ADMIN).default(ROLES.USER),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255),
  email: Joi.string().trim().email(),
  password: Joi.string().min(8).max(72),
  role: Joi.string().valid(ROLES.USER, ROLES.ADMIN),
}).min(1);

export const userIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});
