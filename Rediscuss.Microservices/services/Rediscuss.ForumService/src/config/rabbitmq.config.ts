import { registerAs } from "@nestjs/config";



export default registerAs('rabbitmq', () => ({
    user: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10) || 5672,
    queue: process.env.RABBITMQ_QUEUE || 'user-creation-queue',
}));