import { ApiProperty } from '@nestjs/swagger';

export class RemoveFollowDto{
    @ApiProperty({ description: 'Discuit id to unfollow' })
    discuitId: string;

    @ApiProperty({ description: 'User id who unfollows' })
    userId: number;
}