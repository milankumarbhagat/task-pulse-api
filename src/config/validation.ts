import * as Joi from 'joi';

export const validationSchema = Joi.object({
    PORT: Joi.number().default(5000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
});