import { ApiProperty } from '@nestjs/swagger';

export class RoleGetDto{
    @ApiProperty()
    _id: string;

    @ApiProperty()
    RoleName: string;

    @ApiProperty()
    Description: string;

    @ApiProperty()
    Scope: string;
}