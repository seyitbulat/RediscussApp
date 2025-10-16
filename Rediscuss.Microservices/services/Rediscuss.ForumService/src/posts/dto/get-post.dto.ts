import { Expose, Transform, Type } from "class-transformer";
import { GetUserDto } from "../../users/dto/get-user.dto";
import { GetDiscuitDto } from "../../discuits/dto/get-discuit.dto";
import { ApiProperty } from '@nestjs/swagger';


export class GetPostDto {
    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    content: string;

    @ApiProperty({ required: false, type: () => GetDiscuitDto })
    @Expose()
    @Type(() => GetDiscuitDto)
    @Transform(({ obj }) => {
        if (typeof obj.discuitId === 'object' && obj.discuitId !== null) {
            return obj.discuitId;
        }
        return null;
    })
    discuit?: GetDiscuitDto;

   
    @ApiProperty({ required: false, type: Number })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.createdBy === 'object' && obj.createdBy?._id) {
            return obj.createdBy._id;
        }
        return obj.createdBy;
    })
    createdBy?: number;

    @ApiProperty({ required: false, type: String, format: 'date-time' })
    @Expose()
    updatedAt?: Date;

    @ApiProperty({ required: false, type: Number })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.updatedBy === 'object' && obj.updatedBy?._id) {
            return obj.updatedBy._id;
        }
        return obj.updatedBy;
    })
    updatedBy?: number;

    @ApiProperty({ required: false })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.createdBy === 'object' && obj.createdBy?.username) {
            return obj.createdBy.username;
        }
        return undefined;
    })
    CreatedByUsername?: string;

    @ApiProperty({ required: false })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.updatedBy === 'object' && obj.updatedBy?.username) {
            return obj.updatedBy.username;
        }
        return undefined;
    })
    UpdatedByUsername?: string;

    @ApiProperty({ required: false })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.discuitId === 'object' && obj.discuitId?.name) {
            return obj.discuitId.name;
        }
        return undefined;
    })
    discuitName?: string;

    @ApiProperty()
    @Expose()
    upChips: number;

    @ApiProperty()
    @Expose()
    downChips: number;

    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => (obj.upChips || 0) - (obj.downChips || 0))
    totalChips: number;

    @ApiProperty({ required: false, type: Number })
    @Expose()
    chipByUser?: number;
   
    @ApiProperty()
    @Expose()
    hotScore: number = 0;
}