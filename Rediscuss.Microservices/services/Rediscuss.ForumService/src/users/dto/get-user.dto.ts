import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    username: string;

    @ApiProperty({ type: [String] })
    roles: string[];
}