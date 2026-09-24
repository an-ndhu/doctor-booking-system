import Joi from 'joi';
import { DateTime } from 'luxon';

const timezoneTimestamp = Joi.string().custom((value, helpers) => {
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    return helpers.error('timestamp.offset');
  }
  if (!DateTime.fromISO(value, { setZone: true }).isValid) {
    return helpers.error('timestamp.invalid');
  }
  return value;
});

export const createAppointmentSchema = Joi.object({
  doctorId: Joi.number().integer().positive().required(),
  startAt: timezoneTimestamp.required(),
}).messages({
  'timestamp.offset': '{{#label}} must include Z or an explicit timezone offset',
  'timestamp.invalid': '{{#label}} must be a valid ISO-8601 timestamp',
});

export const appointmentIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});
