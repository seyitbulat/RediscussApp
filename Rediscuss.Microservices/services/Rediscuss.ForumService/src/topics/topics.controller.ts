import { Controller, Get, Param, Post, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { GetUser } from '../auth/user.decorator';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { GetTopicDto } from './dto/get-topic.dto';
import { JsonApiResource } from '../common/dto/api-response.dto';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all topics with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiOkResponse({ type: GetTopicDto, isArray: true })
  async getList(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ): Promise<ControllerResponseDto<GetTopicDto>> {
    const topics = await this.topicsService.getList(page, pageSize);
    
    const resources = topics.data.map(topic => new JsonApiResource<GetTopicDto>({
      type: 'topic',
      id: topic.slug,
      attributes: topic as unknown as GetTopicDto,
    }));

    const meta = {
      total: topics.total.toString(),
      page: topics.page.toString(),
      pageSize: topics.pageSize.toString(),
      totalPages: topics.totalPages.toString(),
      hasNextPage: topics.hasNextPage.toString(),
      hasPreviousPage: topics.hasPreviousPage.toString(),
      nextPage: topics.nextPage !== null ? topics.nextPage.toString() : '',
      previousPage: topics.previousPage !== null ? topics.previousPage.toString() : '',
    };

    const links = {
      self: `/topics/list?page=${meta.page}&pageSize=${meta.pageSize}`,
      first: `/topics/list?page=1&pageSize=${meta.pageSize}`,
      last: `/topics/list?page=${meta.totalPages}&pageSize=${meta.pageSize}`,
      next: topics.hasNextPage ? `/topics/list?page=${meta.nextPage}&pageSize=${meta.pageSize}` : null,
      previous: topics.hasPreviousPage ? `/topics/list?page=${meta.previousPage}&pageSize=${meta.pageSize}` : null,
    };

    return new ControllerResponseDto(resources, meta, links);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GetTopicDto })
  async getById(@Param('id') id: string): Promise<ControllerResponseDto<GetTopicDto>> {
    const topic = await this.topicsService.getById(id);
    
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const resource = new JsonApiResource<GetTopicDto>({
      type: 'topic',
      id: topic.slug,
      attributes: topic as unknown as GetTopicDto,
    });

    return new ControllerResponseDto(resource);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('follow/:topicId')
  @ApiOperation({ summary: 'Follow a topic' })
  @ApiParam({ name: 'topicId', type: String })
  @ApiOkResponse({ type: GetTopicDto })
  async follow(
    @Param('topicId') topicId: string,
    @GetUser() user: any
  ): Promise<ControllerResponseDto<GetTopicDto>> {
    const topic = await this.topicsService.followTopic(topicId, user.userId);
    
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const resource = new JsonApiResource<GetTopicDto>({
      type: 'topic',
      id: topic.id,
      attributes: topic as unknown as GetTopicDto,
    });

    return new ControllerResponseDto(resource);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('unfollow/:topicId')
  @ApiOperation({ summary: 'Unfollow a topic' })
  @ApiParam({ name: 'topicId', type: String })
  @ApiOkResponse({ type: GetTopicDto })
  async unfollow(
    @Param('topicId') topicId: string,
    @GetUser() user: any
  ): Promise<ControllerResponseDto<GetTopicDto>> {
    const topic = await this.topicsService.unFollowTopic(topicId, user.userId);
    
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const resource = new JsonApiResource<GetTopicDto>({
      type: 'topic',
      id: topic.id,
      attributes: topic as unknown as GetTopicDto,
    });

    return new ControllerResponseDto(resource);
  }
}
