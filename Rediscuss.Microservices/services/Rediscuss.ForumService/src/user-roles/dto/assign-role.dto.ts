import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto{
    @ApiProperty()
    userId: number;

    @ApiProperty()
    roleId: string;
}