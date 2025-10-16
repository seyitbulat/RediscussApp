import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model, Mongoose, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { plainToInstance } from 'class-transformer';
import { ChipsService } from '../chips/chips.service';
import { PaginatedServiceResponseDto } from '../common/dto/paginated-service-response.dto';

@Injectable()
export class PostsService {
    constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        private readonly chipsService: ChipsService) { }


    async create(createPostDto: CreatePostDto, userId: string): Promise<GetPostDto> {
        const post = {
            ...createPostDto,
            createdDate: new Date(),
            createdBy: userId,
            isDeleted: false
        };

        const createdPost = await this.postModel.create(post);
        const plainPost = createdPost.toObject();

        return plainToInstance(GetPostDto, plainPost, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }


    async getById(id: string, userId: number | undefined): Promise<GetPostDto | null> {
        const post = await this.postModel
            .findOne({ _id: id, isDeleted: false })
            .populate('createdBy')
            .populate('discuitId')
            .exec();

        if (!post) return null;

        const plainPost = post.toObject();

        const chips = await this.chipsService.getVoteResult(id.toString());
        (plainPost as any).upChips = chips.upVote;
        (plainPost as any).downChips = chips.downVote;

        if (userId) {
            const chipByUser = await this.chipsService.getUserVote(id.toString(), userId);
            (plainPost as any).chipByUser = chipByUser;
        }

        return plainToInstance(GetPostDto, plainPost, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }


    async getByDiscuit(discuitId: string, page: number = 1, pageSize: number = 10, userId: number | undefined): Promise<PaginatedServiceResponseDto<GetPostDto>> {
        const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
        const pageSizeNumber = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;

        const posts = await this.postModel.find({ discuitId: discuitId, isDeleted: false })
            .populate('createdBy')
            .populate('discuitId')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSizeNumber)
            .limit(pageSizeNumber)
            .exec();

        const postCount = await this.postModel.countDocuments({ discuitId: discuitId, isDeleted: false });

        const postDtos = await Promise.all(posts.map(async post => {
            const id = post._id.toString();
            const plainPost = post.toObject();
            const chips = await this.chipsService.getVoteResult(id.toString());
            (plainPost as any).upChips = chips.upVote;
            (plainPost as any).downChips = chips.downVote;

            if (userId) {

                const chipByUser = await this.chipsService.getUserVote(id.toString(), userId);
                (plainPost as any).chipByUser = chipByUser;
            }

            (plainPost as any).hotScore = await this.calculateHotScore(
                (plainPost as any).upChips,
                (plainPost as any).downChips,
                plainPost.createdAt
            );

            return plainToInstance(GetPostDto, plainPost, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true
            });
        }));

        return new PaginatedServiceResponseDto(postDtos, postCount, pageNumber, pageSizeNumber);
    }

    async getHomeFeed(page: number = 1, pageSize: number = 10, userId: number | undefined): Promise<PaginatedServiceResponseDto<GetPostDto>> {
        const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
        const pageSizeNumber = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
        const posts = await this.postModel.find({ isDeleted: false })
            .populate('createdBy')
            .populate('discuitId')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSizeNumber)
            .limit(pageSizeNumber)
            .exec();    
        const postCount = await this.postModel.countDocuments({ isDeleted: false });

        const postDtos = await Promise.all(posts.map(async post => {
            const id = post._id.toString();
            const plainPost = post.toObject();
            const chips = await this.chipsService.getVoteResult(id.toString());
            (plainPost as any).upChips = chips.upVote;
            (plainPost as any).downChips = chips.downVote; 
            if (userId) {
                const chipByUser = await this.chipsService.getUserVote(id.toString(), userId);
                (plainPost as any).chipByUser = chipByUser;
            }
            (plainPost as any).hotScore = await this.calculateHotScore(
                (plainPost as any).upChips,
                (plainPost as any).downChips,
                plainPost.createdAt
            ); 
            return plainToInstance(GetPostDto, plainPost, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true
            });
        }));

        return new PaginatedServiceResponseDto(postDtos.sort((a, b) => b.hotScore - a.hotScore), postCount, pageNumber, pageSizeNumber);
    }



    async calculateHotScore(upChips: number, downChips: number, createdAt: Date): Promise<number> {
        const score = upChips - downChips;
        const order = Math.log10(Math.max(Math.abs(score), 1));
        const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
        const seconds = (createdAt.getTime() / 1000) - 1134028003;
        return Math.round((order + sign * seconds / 45000) * 100000) / 100000;
    }

}