import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Payload } from '@nestjs/microservices';
import { UserRolesService } from '../user-roles/user-roles.service';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userRoleService: UserRolesService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userData = {
      _id: createUserDto.userId,
      username: createUserDto.username
    };

    const user = await this.userModel.findOneAndUpdate(
      { _id: userData._id },
      userData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await this.userRoleService.assignRoleToUser({ userId: parseInt(createUserDto.userId), roleId: '68e520f0c59202573b0ed319' }); 
    return user;
  }


  async findById(id: number): Promise<GetUserDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userDto = new GetUserDto();
    userDto.id = user._id;
    userDto.username = user.username;
    return userDto;
  }

}
