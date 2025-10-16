import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscutDto } from './dto/create-discuit.dto';
import { GetDiscuitDto } from './dto/get-discuit.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Discuit, DiscuitDocument } from './schemas/discuit.schema';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class DiscuitsService {
    constructor(
        @InjectModel(Discuit.name) private DiscuitModel: Model<Discuit>,
        private followsService: FollowsService
    ) { }

    async create(createDiscuitDto: CreateDiscutDto, user?: any): Promise<GetDiscuitDto> {
        const discuit = {
            ...createDiscuitDto,
            createdBy: user.userId,
            createdDate: new Date()
        };
        const createdDiscuit = await this.DiscuitModel.create(discuit);
        const result = plainToClass(GetDiscuitDto, createdDiscuit.toObject());
        result.CreatedByUsername = user.username;
        return result;
    }

    async getByName(name: string, userId?: number): Promise<GetDiscuitDto> {
        const discuit = await this.DiscuitModel.findOne({ name: name, isDeleted: false })
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .exec();



        if (!discuit) {
            throw new NotFoundException(`Discuit with name ${name} not found`);
        }

        const discuitDto = plainToClass(GetDiscuitDto, discuit.toObject());

        if (userId) {

            const isUserFollowingDiscuit = await this.followsService.isUserFollowingDiscuit(userId || 0, discuit?._id.toString() || '');

            discuitDto.isFollowedByCurrentUser = isUserFollowingDiscuit;
        }

        const followersCount = await this.followsService.getDiscuitFollowersCount(discuit?._id.toString() || '');
        discuitDto.followersCount = followersCount;


        return discuitDto;
    }


    async getRecommended(userId?: number): Promise<GetDiscuitDto[]> {
        const discuits = await this.DiscuitModel.find({ isDeleted: false })
            .sort({ followersCount: -1 })
            .limit(10)
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .exec();

        const discuitDtos = await Promise.all(discuits.map(async (discuit) => {
            const discuitDto = plainToClass(GetDiscuitDto, discuit.toObject());
            if (userId) {
                const isUserFollowingDiscuit = await this.followsService.isUserFollowingDiscuit(userId || 0, discuit?._id.toString() || '');
                discuitDto.isFollowedByCurrentUser = isUserFollowingDiscuit;
            }
            const followersCount = await this.followsService.getDiscuitFollowersCount(discuit?._id.toString() || '');
            discuitDto.followersCount = followersCount;
            return discuitDto;
        }));

        return discuitDtos;
    }
}
