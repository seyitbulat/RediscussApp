import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChipsModule } from '../chips/chips.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema}]),
    AuthModule,
    UsersModule,
    ChipsModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
