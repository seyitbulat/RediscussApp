import { Module } from '@nestjs/common';
import { DiscuitsService } from './discuits.service';
import { DiscuitsController } from './discuits.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Discuit, DiscuitSchema } from './schemas/discuit.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Discuit.name, schema: DiscuitSchema}]),
    AuthModule,
    UsersModule,
    FollowsModule
  ],
  controllers: [DiscuitsController],
  providers: [DiscuitsService],
})
export class DiscuitsModule {}
