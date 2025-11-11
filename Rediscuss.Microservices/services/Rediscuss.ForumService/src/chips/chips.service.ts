import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { VoteChipDto } from './dto/vote-chip.dto';
import { ResultChipDto } from './dto/result-chip.dto';

@Injectable()
export class ChipsService {
    constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) { }

    async voteChip(userId: number, voteChipDto: VoteChipDto): Promise<ResultChipDto> {
        const { postId, direction } = voteChipDto;

        const postVoteKey = `post:votes:${postId}`;
        const userVoteKey = `post:uservotes:${postId}`;

        const existingVote = await this.redisClient.hget(userVoteKey, userId.toString());
        const currentVote = existingVote ? parseInt(existingVote, 10) : 0;

        // Aynı oyu tekrar veriyorsa, oyu geri al
        if (currentVote === direction) {
            await this.redisClient.hset(userVoteKey, userId.toString(), 0);
            if (direction === 1) {
                await this.redisClient.hincrby(postVoteKey, 'upVote', -1);
            } else {
                await this.redisClient.hincrby(postVoteKey, 'downVote', -1);
            }
        }
        else if (currentVote !== 0 && currentVote !== direction) {
            await this.redisClient.hset(userVoteKey, userId.toString(), direction);
            if (direction === 1) {
                await this.redisClient.hincrby(postVoteKey, 'upVote', 1);
                await this.redisClient.hincrby(postVoteKey, 'downVote', -1);
            } else {
                await this.redisClient.hincrby(postVoteKey, 'downVote', 1);
                await this.redisClient.hincrby(postVoteKey, 'upVote', -1);
            }
        }
        // Hiç oy vermemişse veya önceden geri almışsa, yeni oy ver
        else if (currentVote === 0) {
            await this.redisClient.hset(userVoteKey, userId.toString(), direction);
            if (direction === 1) {
                await this.redisClient.hincrby(postVoteKey, 'upVote', 1);
            } else {
                await this.redisClient.hincrby(postVoteKey, 'downVote', 1);
            }
        }

        const result = await this.redisClient.hgetall(postVoteKey);
        return {
            upVote: parseInt(result.upVote || '0', 10),
            downVote: parseInt(result.downVote || '0', 10)
        } as ResultChipDto;
    }



    async getVoteResult(postId: string): Promise<ResultChipDto> {
        const postVoteKey = `post:votes:${postId}`;
        const result = await this.redisClient.hgetall(postVoteKey);
        return {
            upVote: parseInt(result.upVote || '0', 10),
            downVote: parseInt(result.downVote || '0', 10)
        } as ResultChipDto;
    }


    async getUserVote(postId: string, userId: number): Promise<number> {
        const userVoteKey = `post:uservotes:${postId}`;
        const existingVote = await this.redisClient.hget(userVoteKey, userId.toString());
        return existingVote ? parseInt(existingVote, 10) : 0;
    }
}