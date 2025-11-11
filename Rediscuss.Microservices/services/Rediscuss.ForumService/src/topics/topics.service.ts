import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';
import { Model } from 'mongoose';
import { GetTopicDto } from './dto/get-topic.dto';
import { plainToInstance } from 'class-transformer';
import { PaginatedServiceResponseDto } from '../common/dto/paginated-service-response.dto';

@Injectable()
export class TopicsService {
    constructor(
        @InjectModel(Topic.name) private readonly topicModel: Model<TopicDocument>
    ) { }

    async getById(id: string): Promise<GetTopicDto | null> {
        const topic = await this.topicModel
            .findOne({ _id: id })
            .exec();

        if (!topic) return null;

        const plainTopic = topic.toObject();

        return plainToInstance(GetTopicDto, plainTopic, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async getList(page: number = 1, pageSize: number = 10): Promise<PaginatedServiceResponseDto<GetTopicDto>> {
        const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
        const pageSizeNumber = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;

        const topics = await this.topicModel.find()
            .sort({ followerCount: -1, name: 1 })
            .skip((pageNumber - 1) * pageSizeNumber)
            .limit(pageSizeNumber)
            .exec();

        const topicCount = await this.topicModel.countDocuments();

        const topicDtos = topics.map(topic => {
            const plainTopic = topic.toObject();
            return plainToInstance(GetTopicDto, plainTopic, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true
            });
        });

        return new PaginatedServiceResponseDto(topicDtos, topicCount, pageNumber, pageSizeNumber);
    }

    async followTopic(topicId: string, userId: string): Promise<GetTopicDto | null> {
        const topic = await this.topicModel.findById(topicId);
        
        if (!topic) return null;
        
        if (topic.followers.includes(userId)) {
            const plainTopic = topic.toObject();
            return plainToInstance(GetTopicDto, plainTopic, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true
            });
        }
        
        topic.followers.push(userId);
        topic.followerCount = topic.followers.length;
        await topic.save();

        const plainTopic = topic.toObject();
        return plainToInstance(GetTopicDto, plainTopic, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }

    async unFollowTopic(topicId: string, userId: string): Promise<GetTopicDto | null> {
        const topic = await this.topicModel.findOneAndUpdate(
            {
                _id: topicId,
                followers: userId,
            },
            {
                $pull: { followers: userId },
                $inc: { followerCount: -1 },
            },
            { new: true }
        );

        if (!topic) return null;

        const plainTopic = topic.toObject();
        return plainToInstance(GetTopicDto, plainTopic, {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
        });
    }
}
