import { ApiProperty } from '@nestjs/swagger';

export class VoteChipDto {
    @ApiProperty({ description: 'Target post id' })
    postId: string;

    @ApiProperty({ enum: [1, -1], description: '1 for up, -1 for down' })
    direction: 1 | -1;

}