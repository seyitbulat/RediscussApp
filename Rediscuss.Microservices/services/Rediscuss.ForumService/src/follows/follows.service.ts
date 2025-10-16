import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { Model } from 'mongoose';
import { CreateFollowDto } from './dto/create-follow.dto';
import { JsonApiResource } from 'src/common/dto/api-response.dto';
import { RemoveFollowDto } from './dto/remove-follow.dto';
import { GetFollowDto } from './dto/get-follow.dto';
import { GetDiscuitDto } from 'src/discuits/dto/get-discuit.dto';

@Injectable()
export class FollowsService {
    constructor(@InjectModel(Follow.name) private readonly followModel: Model<FollowDocument>) { }

    async create(CreateFollowDto: CreateFollowDto) {
        const follow = await this.followModel.findOne({ discuitId: CreateFollowDto.discuitId, userId: CreateFollowDto.userId, isDeleted: false });
        if(follow){
            throw new Error('Already following this discuit');
        }

        const createdFollow = new this.followModel(CreateFollowDto);
        createdFollow.createdAt = new Date();
        createdFollow.createdBy = CreateFollowDto.userId;
        return createdFollow.save();
    }


    async remove(removeFollowDto: RemoveFollowDto){
        const follow = await this.followModel.findOne({ discuitId: removeFollowDto.discuitId, userId: removeFollowDto.userId, isDeleted: false });
        if(!follow){
            throw new Error('Follow not found');
        }

        follow.isDeleted = true;
        follow.deletedAt = new Date();
        follow.deletedBy = removeFollowDto.userId;
        return follow.save();
    }


    async getUserFollows(userId: number) : Promise<GetFollowDto[]>{
        const follows = await this.followModel.find({ userId: userId, isDeleted: false })
            .populate({path: 'discuitId', model: 'Discuit'}).exec();

        const result: GetFollowDto[] = follows.map(follow => {
            const followDto = new GetFollowDto();
            followDto.discuitId = follow.discuitId as unknown as string;
            followDto.userId = follow.userId as unknown as number;
            followDto.createdAt = follow.createdAt;
            followDto.discuit = follow.discuitId as unknown as GetDiscuitDto;
            return followDto;
        });
        return result;
    }


    async getDiscuitFollowersCount(discuitId: string): Promise<number>{
        return this.followModel.countDocuments({ discuitId: discuitId, isDeleted: false }).exec();
    }

    async isUserFollowingDiscuit(userId: number, discuitId: string): Promise<boolean>{
        const follow = await this.followModel.findOne({ userId: userId, discuitId: discuitId, isDeleted: false }).exec();
        return !!follow;
    }
}
