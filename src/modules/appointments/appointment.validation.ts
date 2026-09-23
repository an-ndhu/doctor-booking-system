import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  doctorId: Joi.number().integer().positive().required(),
  startAt: Joi.string().isoDate().required(),
});

export const appointmentIdParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});
