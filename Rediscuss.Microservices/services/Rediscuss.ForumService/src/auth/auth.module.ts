import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import appConfig from '../config/app.config';

@Module({
    imports: [
        ConfigModule, 
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [appConfig.KEY],
            useFactory: async (configService:ConfigType<typeof appConfig>) => {
                const secret = configService.jwtSecret;
                if (!secret) {
                    throw new Error('External JWT secret is not defined');
                }
                return {
                    secret: Buffer.from(secret, 'base64'),
                    signOptions: {
                        issuer: configService.jwtIssuer,
                        audience: configService.jwtAudience,
                    },
                };
            },
        }),
    ],
    providers: [JwtStrategy],
    exports: [PassportModule],
})
export class AuthModule {}
