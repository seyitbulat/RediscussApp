import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Topic.name, schema: TopicSchema}]),
    AuthModule,
    UsersModule
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [MongooseModule]
})
export class TopicsModule {}
