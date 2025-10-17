import { ApiProperty } from '@nestjs/swagger';

export class ResultChipDto {
    @ApiProperty()
    upVote: number;

    @ApiProperty()
    downVote: number;
}