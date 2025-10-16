import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ description: 'Unique user id coming from auth service' })
    userId: string;

    @ApiProperty({ description: 'Username' })
    username: string;
}
