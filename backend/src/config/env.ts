import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
    PORT: number;
    NODE_ENV: string;
    db: {
        connectionString: string;
    };
    jwt: {
        secret: string;
    };
    aiServiceUrl: string;
    google: {
        clientId: string | undefined;
        clientSecret: string | undefined;
        callbackUrl: string;
    };
    uploads: {
        path: string;
    };
}

const envSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    AI_SERVICE_URL: Joi.string().default('http://localhost:8000'),
    GOOGLE_CLIENT_ID: Joi.string(),
    GOOGLE_CLIENT_SECRET: Joi.string(),
    S3_BUCKET: Joi.string(),
    UPLOAD_PATH: Joi.string().default('uploads/'),
}).unknown().required();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config: Config = {
    PORT: envVars.PORT,
    NODE_ENV: envVars.NODE_ENV,
    db: {
        connectionString: envVars.DATABASE_URL,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
    },
    aiServiceUrl: envVars.AI_SERVICE_URL,
    google: {
        clientId: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        callbackUrl: '/api/auth/google/callback'
    },
    uploads: {
        path: envVars.UPLOAD_PATH,
    }
};

export default config;
