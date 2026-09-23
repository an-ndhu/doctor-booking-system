import Joi from 'joi';

export const timezoneSchema = Joi.object({
  timezone: Joi.string().trim().required(),
});
