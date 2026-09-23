import Joi from 'joi';

export const createDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  specialization: Joi.string().trim().min(2).max(255).required(),
  email: Joi.string().trim().email().allow(null, ''),
  isActive: Joi.boolean(),
});

export const updateDoctorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255),
  specialization: Joi.string().trim().min(2).max(255),
  email: Joi.string().trim().email().allow(null, ''),
  isActive: Joi.boolean(),
}).min(1);

export const doctorIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});
