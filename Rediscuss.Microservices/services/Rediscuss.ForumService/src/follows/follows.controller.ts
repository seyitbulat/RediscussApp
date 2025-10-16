import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { RemoveFollowDto } from './dto/remove-follow.dto';
import { GetUser } from '../auth/user.decorator';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { JsonApiResource } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { GetFollowDto } from './dto/get-follow.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a discuit' })
  @ApiBody({ type: CreateFollowDto })
  @ApiOkResponse({ type: GetFollowDto })
  async follow(@Body() createFollowDto: CreateFollowDto, @GetUser() user: any): Promise<ControllerResponseDto<GetFollowDto>> {
    createFollowDto.userId = user.userId;
    const follow = await this.followsService.create(createFollowDto);
    const resource = new JsonApiResource<GetFollowDto>({
      type: 'follow',
      id: (follow._id ?? follow.id ?? '').toString(),
      attributes: follow as unknown as GetFollowDto,
    });
    return new ControllerResponseDto(resource);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a discuit' })
  @ApiBody({ type: RemoveFollowDto })
  @ApiOkResponse({ type: GetFollowDto })
  async unfollow(@Body() removeFollowDto: RemoveFollowDto, @GetUser() user: any): Promise<ControllerResponseDto<GetFollowDto>> {
    removeFollowDto.userId = user.userId;
    const follow = await this.followsService.remove(removeFollowDto);
    const resource = new JsonApiResource<GetFollowDto>({
      type: 'follow',
      id: (follow._id ?? follow.id ?? '').toString(),
      attributes: follow as unknown as GetFollowDto,
    });
    return new ControllerResponseDto(resource);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get follows for a user' })
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: GetFollowDto, isArray: true })
  async getUserFollows(@Param('userId') userId: string): Promise<ControllerResponseDto<GetFollowDto[]>> {
    const userIdNum = Number(userId);
    const follows = await this.followsService.getUserFollows(userIdNum);
    const resource = new JsonApiResource<GetFollowDto[]>({
      type: 'follows',
      id: userId.toString(),
      attributes: follows as unknown as GetFollowDto[],
    });
    return new ControllerResponseDto(resource);
  }
}
