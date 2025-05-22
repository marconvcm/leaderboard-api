import Joi from 'joi';

export const scoreSchema = Joi.object({
   username: Joi.string().required(),
   score: Joi.number().required(),
});
