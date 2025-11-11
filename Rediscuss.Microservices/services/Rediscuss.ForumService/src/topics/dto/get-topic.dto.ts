import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";



export class GetTopicDto {
    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    slug: string;

    @ApiProperty()
    @Expose()
    followerCount: number;
}