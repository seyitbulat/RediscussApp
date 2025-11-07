import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]),
    AuthModule,
    UsersModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
