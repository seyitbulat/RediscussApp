import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowDto {
    @ApiProperty({ description: 'Discuit id to follow' })
    discuitId: string;

    @ApiProperty({ description: 'User id who follows' })
    userId: number;
}