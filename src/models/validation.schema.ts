import Joi from 'joi';

export const userSchema = Joi.object({
   username: Joi.string().required(),
});

export const scoreSchema = Joi.object({
   username: Joi.string().required(),
   score: Joi.number().required(),
});

const nicknameValidation = Joi.string().pattern(/^[A-Za-z0-9_-]{4,10}$/).required()
   .messages({
      'string.pattern.base': 'Nickname must be 4 to 10 characters and only contain letters, numbers, _ or -'
   })

export const nicknameSchema = Joi.object({
   nickname: nicknameValidation,
   UID: Joi.string().uuid({ version: 'uuidv4' }).required()
      .messages({
         'string.pattern.base': 'UID must be a valid UUID v4'
      }),
});

export const updateNicknameSchema = Joi.object({
   nickname: nicknameValidation,
});
