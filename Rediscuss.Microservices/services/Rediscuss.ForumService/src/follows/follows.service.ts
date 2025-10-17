import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { Model } from 'mongoose';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JsonApiResource } from 'src/common/dto/api-response.dto';
import { RemoveFollowDto } from './dto/remove-follow.dto';
import { GetFollowDto } from './dto/get-follow.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FollowsService {
    constructor(@InjectModel(Follow.name) private readonly followModel: Model<FollowDocument>) { }

    async create(CreateFollowDto: CreateFollowDto) {
        const follow = await this.followModel.findOne({ discuitId: CreateFollowDto.discuitId, userId: CreateFollowDto.userId, isDeleted: false });
        if (follow) {
            throw new Error('Already following this discuit');
        }

        const createdFollow = new this.followModel(CreateFollowDto);
        createdFollow.isDeleted = false;
        createdFollow.discuit = CreateFollowDto.discuitId;
        createdFollow.user = CreateFollowDto.userId;
        createdFollow.createdAt = new Date();
        createdFollow.createdBy = CreateFollowDto.userId.toString();

        const savedFollow = await createdFollow.save();
        const followDto = plainToClass(GetFollowDto, savedFollow.toObject(), { excludeExtraneousValues: true });
        return followDto;
    }


    async remove(removeFollowDto: RemoveFollowDto) {
        const follow = await this.followModel.findOne({ discuitId: removeFollowDto.discuitId, userId: removeFollowDto.userId, isDeleted: false });
        if (!follow) {
            throw new Error('Follow not found');
        }

        follow.isDeleted = true;
        follow.deletedAt = new Date();
        follow.deletedBy = removeFollowDto.userId.toString();
        return follow.save();
    }


    async getUserFollows(userId: string): Promise<GetFollowDto[]> {
        const follows = await this.followModel.find({ user: userId, isDeleted: false })
            .populate({ path: 'discuit', model: 'Discuit' }).exec();

        const result = plainToClass(GetFollowDto, follows, { excludeExtraneousValues: true });

        return result;
    }

    async getUserFollowedDiscuitIds(userId: string): Promise<string[]> {
        const follows = await this.followModel.find({ user: userId, isDeleted: false }).select('discuit').exec();
        return follows.map(follow => follow.discuit.toString());
    }


    async getDiscuitFollowersCount(discuitId: string): Promise<number> {
        return this.followModel.countDocuments({ discuitId: discuitId, isDeleted: false }).exec();
    }

    async isUserFollowingDiscuit(userId: string, discuitId: string): Promise<boolean> {
        const follow = await this.followModel.findOne({ userId: userId, discuitId: discuitId, isDeleted: false }).exec();
        return !!follow;
    }
}
