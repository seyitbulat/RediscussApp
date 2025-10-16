import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create user (internal)' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Created user', schema: { type: 'object' } })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('UserCreated')
  @ApiOperation({ summary: 'Handle user created event (RMQ)' })
  handleUserCreated(
    @Payload() data: CreateUserDto
  ) {
    return this.usersService.create(data);
  }
}
