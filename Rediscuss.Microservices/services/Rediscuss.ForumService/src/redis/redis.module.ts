import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import redisConfig from '../config/redis.config';
import { ConfigType } from '@nestjs/config';

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [redisConfig.KEY],
            useFactory: (rc: ConfigType<typeof redisConfig>) => {
                console.log(`Connecting to Redis with host: ${rc.host}, port: ${rc.port}`);
                const client = new Redis({
                    host: rc.host,
                    port: rc.port,
                });
                return client;
            }
        }
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
