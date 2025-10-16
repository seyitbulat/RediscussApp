import {z} from "zod";


export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    PORT: z.coerce.number().default(3000),

    EXTERNAL_JWT_ISSUER: z.string().default('Rediscuss.IdentityService'),
    EXTERNAL_JWT_AUDIENCE: z.string().default('Rediscuss.ApiGateway'),
    EXTERNAL_JWT_SECRET: z.string().default('VxXENF67WbFJfGqm1BZWzJQzPj9h0cQtT+l0wvHR6kg='),

    MONGODB_URI: z.string().default('mongodb://root:String.123!@localhost:27017'),
    MONGODB_DB_NAME: z.string().default('RediscussForumDB'),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    
    RABBITMQ_USER: z.string().default('guest'),
    RABBITMQ_PASSWORD: z.string().default('guest'),
    RABBITMQ_QUEUE: z.string().default('user-creation-queue'),
    RABBITMQ_HOST: z.string().default('localhost'),
    RABBITMQ_PORT: z.coerce.number().default(5672),
});