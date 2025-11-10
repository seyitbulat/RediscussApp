import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { plainToInstance } from 'class-transformer';
import { GetCommentDto } from './dto/get-comment.dto';
import { PaginatedServiceResponseDto } from '../common/dto/paginated-service-response.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private CommentModel: Model<Comment>
    ){}

    async create(createCommentDto: CreateCommentDto, user: any): Promise<GetCommentDto>{
        const comment = {
            ...createCommentDto,
            createdBy: user.userId.toString(),
            createdDate: new Date()
        };

        const createdComment = await this.CommentModel.create(comment);

        const result = plainToInstance(GetCommentDto, createdComment.toObject(), { excludeExtraneousValues: true });

        return result;
    }

    async getByPost(postId: string, page: number = 1, pageSize: number = 10, userId?: string): Promise<PaginatedServiceResponseDto<GetCommentDto>>{
        const pageNumber = typeof page === 'string' ? parseInt(page as unknown as string, 10) : page;
        const pageSizeNumber = typeof pageSize === 'string' ? parseInt(pageSize as unknown as string, 10) : pageSize;

        const comments = await this.CommentModel.find({ postId: postId, isDeleted: false })
            .populate('createdBy')
            .populate('parentCommentId')
            .sort({ createdAt: 1 })
            .skip((pageNumber - 1) * pageSizeNumber)
            .limit(pageSizeNumber)
            .exec();

        const total = await this.CommentModel.countDocuments({ postId: postId, isDeleted: false });

        const commentDtos = comments.map(c => plainToInstance(GetCommentDto, c.toObject(), { excludeExtraneousValues: true }));

        return new PaginatedServiceResponseDto<GetCommentDto>(commentDtos, total, pageNumber, pageSizeNumber);
    }


    async getCountByPost(postId: string): Promise<number>{
        const commentCount = await this.CommentModel.countDocuments({postId: postId, isDeleted: false})
        return commentCount;
    }
}
