import { GetDiscuitDto } from "../../discuits/dto/get-discuit.dto";
import { ApiProperty } from '@nestjs/swagger';



export class GetFollowDto{
    @ApiProperty()
    discuitId: string;

    @ApiProperty()
    userId: number;

    @ApiProperty({ required: false, type: String, format: 'date-time' })
    createdAt?: Date;

    @ApiProperty({ type: () => GetDiscuitDto })
    discuit: GetDiscuitDto;
}