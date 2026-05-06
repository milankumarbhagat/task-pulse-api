import * as Joi from 'joi';

export const validationSchema = Joi.object({
    PORT: Joi.number().default(5000),
    DB_HOST: Joi.string().optional(),
    DB_PORT: Joi.number().optional(),
    DB_USER: Joi.string().optional(),
    DB_PASS: Joi.string().optional(),
    DB_NAME: Joi.string().optional(),
    DATABASE_URL: Joi.string().required(),
    DIRECT_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    FRONTEND_URL: Joi.string().uri().optional(),
    RESEND_API_KEY: Joi.string().required(),
    RESEND_USE_CUSTOM_DOMAIN: Joi.string().valid('true', 'false').optional().default('false'),
    RESEND_FROM_EMAIL: Joi.string().email().optional(),
});