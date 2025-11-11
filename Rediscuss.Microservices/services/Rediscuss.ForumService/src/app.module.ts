import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SeedingService } from './seeding.service';
import { UserRolesModule } from './user-roles/user-roles.module';
import { AuthModule } from './auth/auth.module';
import { DiscuitsModule } from './discuits/discuits.module';
import { FollowsModule } from './follows/follows.module';
import { RedisModule } from './redis/redis.module';
import { PostsModule } from './posts/posts.module';
import { ChipsModule } from './chips/chips.module';
import appConfig from './config/app.config';
import mongodbConfig from './config/mongodb.config';
import redisConfig from './config/redis.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { envSchema } from './config/env.validation';
import { CommentsModule } from './comments/comments.module';
import { TopicsModule } from './topics/topics.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      load: [appConfig, mongodbConfig, redisConfig, rabbitmqConfig],
      validate: (env) => {
        const parsed = envSchema.safeParse(env);
        if (!parsed.success) {
          const msg = parsed.error.message;
          throw new Error(`Invalid environment variables: ${msg}`);
        }
        return parsed.data; 
      }
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        dbName: configService.getOrThrow<string>('MONGODB_DB_NAME'),
      }),
    }),
    UsersModule,
    PermissionsModule,
    RolesModule,
    UserRolesModule,
    AuthModule,
    DiscuitsModule,
    FollowsModule,
    RedisModule,
    PostsModule,
    ChipsModule,
    CommentsModule,
    TopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedingService],
})
export class AppModule { }
