import { Expose, plainToClass, Transform } from "class-transformer";
import { GetDiscuitDto } from "../../discuits/dto/get-discuit.dto";
import { ApiProperty } from '@nestjs/swagger';



export class GetFollowDto{

    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id: string;

    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => plainToClass(GetDiscuitDto, obj.discuit, { excludeExtraneousValues: true }))
    discuit: GetDiscuitDto;

    @ApiProperty()
    @Expose()
    @Transform(({ obj }) => obj.user?.toString() || obj.user)
    userId: string;

    @ApiProperty({ required: false, type: String, format: 'date-time' })
    createdAt?: Date;

}