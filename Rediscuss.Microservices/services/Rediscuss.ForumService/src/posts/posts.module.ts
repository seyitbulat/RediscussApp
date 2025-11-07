import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChipsModule } from '../chips/chips.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema}]),
    AuthModule,
    UsersModule,
    ChipsModule,
    CommentsModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
