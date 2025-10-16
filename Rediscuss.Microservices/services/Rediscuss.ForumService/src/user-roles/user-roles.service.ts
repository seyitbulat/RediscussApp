import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from './schemas/user-role.schema';
import { Model } from 'mongoose';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class UserRolesService {
    constructor(
        @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>
    ){}

    async assignRoleToUser(assignRoleDto: AssignRoleDto): Promise<UserRole> {
        const userRoleData = {
            UserId: assignRoleDto.userId,
            RoleId: assignRoleDto.roleId
        };
        return await this.userRoleModel.create(userRoleData);
    }
}
