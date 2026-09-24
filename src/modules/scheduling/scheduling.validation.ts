import Joi from 'joi';
import { DateTime } from 'luxon';
import { EXCEPTION_TYPES } from '../../shared/constants';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const intervalSchema = Joi.object({
  start: Joi.string().pattern(timePattern).required(),
  end: Joi.string().pattern(timePattern).required(),
});

const timezoneTimestamp = Joi.string().custom((value, helpers) => {
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    return helpers.error('timestamp.offset');
  }
  if (!DateTime.fromISO(value, { setZone: true }).isValid) {
    return helpers.error('timestamp.invalid');
  }
  return value;
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
  startAt: timezoneTimestamp.required(),
  endAt: timezoneTimestamp.required(),
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
    .custom((value, helpers) => {
      const parsed = DateTime.fromISO(value, { zone: 'UTC' });
      if (!parsed.isValid || parsed.toISODate() !== value) {
        return helpers.error('date.invalid');
      }
      return value;
    })
    .required(),
}).messages({
  'date.invalid': '{{#label}} must be a valid calendar date',
  'timestamp.offset': '{{#label}} must include Z or an explicit timezone offset',
  'timestamp.invalid': '{{#label}} must be a valid ISO-8601 timestamp',
});
