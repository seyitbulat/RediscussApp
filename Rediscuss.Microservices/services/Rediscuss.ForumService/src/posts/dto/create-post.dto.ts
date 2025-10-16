import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto{
    @ApiProperty()
    title: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ description: 'Discuit id for the post' })
    discuitId: string;
}