import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetCommentDto {
    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id: string;

    @ApiProperty({ required: false, type: String })
    @Expose()
    content: string;

    @ApiProperty({required: false, type: String})
    @Expose()
    @Transform(({obj}) => {
        if(typeof obj === 'object'){
            return obj._id;
        }
        return null;
    })
    parentCommentId: string;

    @ApiProperty({ required: true, type: String })
    @Expose()
    postId: string;

    @ApiProperty({ required: false, type: String, format: 'date-time' })
    @Expose()
    createdAt?: Date;

    @ApiProperty({ required: false, type: Number })
    @Expose()
    @Transform(({ obj }) => {
        if (typeof obj.createdBy === 'object' && obj.createdBy?._id) {
            return obj.createdBy._id;
        }
        return obj.createdBy;
    })
    createdBy?: string;

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
    updatedBy?: string;

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
}