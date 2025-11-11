import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChipsModule } from '../chips/chips.module';
import { CommentsModule } from '../comments/comments.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema}]),
    AuthModule,
    UsersModule,
    ChipsModule,
    CommentsModule,
    TopicsModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
