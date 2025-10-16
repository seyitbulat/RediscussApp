import { registerAs } from "@nestjs/config";


export default registerAs('app', () => ({
    port: parseInt(process.env.PORT || '3000', 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtIssuer: process.env.EXTERNAL_JWT_ISSUER || 'Rediscuss.IdentityService',
    jwtAudience: process.env.EXTERNAL_JWT_AUDIENCE || 'Rediscuss.ApiGateway',
    jwtSecret: process.env.EXTERNAL_JWT_SECRET || 'VxXENF67WbFJfGqm1BZWzJQzPj9h0cQtT+l0wvHR6kg=',
}));