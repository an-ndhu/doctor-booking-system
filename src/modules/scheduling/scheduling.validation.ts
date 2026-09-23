import Joi from 'joi';
import { EXCEPTION_TYPES } from '../../shared/constants';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const intervalSchema = Joi.object({
  start: Joi.string().pattern(timePattern).required(),
  end: Joi.string().pattern(timePattern).required(),
});

export const scheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  intervals: Joi.array().items(intervalSchema).min(1),
  startTime: Joi.string().pattern(timePattern),
  endTime: Joi.string().pattern(timePattern),
})
  .xor('intervals', 'startTime')
  .and('startTime', 'endTime');

export const exceptionSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(EXCEPTION_TYPES))
    .required(),
  startAt: Joi.string().isoDate().required(),
  endAt: Joi.string().isoDate().required(),
  reason: Joi.string().trim().max(255).allow(null, ''),
});

export const doctorIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const exceptionIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const availabilityQuerySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});
