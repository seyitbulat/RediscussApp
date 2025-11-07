import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import appConfig from '../config/app.config';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject(appConfig.KEY ) configService: ConfigType<typeof appConfig>,
    ) {
        const secret = configService.jwtSecret;
        const issuer = configService.jwtIssuer;
        const audience = configService.jwtAudience;

        if (!secret || !issuer || !audience) {
            throw new Error('JWT configuration is missing required values');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: Buffer.from(secret, 'base64'),
            issuer: issuer,
            audience: audience,
            algorithms: ['HS256'],
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, role: payload.role, username: payload.name };
    }
}