import Joi from 'joi';

export const userSchema = Joi.object({
   username: Joi.string().required(),
});

export const scoreSchema = Joi.object({
   username: Joi.string().required(),
   score: Joi.number().required(),
});
