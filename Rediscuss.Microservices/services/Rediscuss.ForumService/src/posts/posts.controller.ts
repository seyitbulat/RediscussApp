import { Body, Controller, Param, Post, Query, UseGuards, Get, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { GetPostDto } from './dto/get-post.dto';
import { GetUser } from '../auth/user.decorator';
import { JsonApiResource } from '../common/dto/api-response.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }


  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post' })
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({ type: GetPostDto })
  async create(@Body() createPostDto: CreatePostDto, @GetUser() user: any): Promise<ControllerResponseDto<GetPostDto>> {
    const post = await this.postsService.create(createPostDto, user.userId);
    const resource = new JsonApiResource<GetPostDto>({
      type: 'post',
      id: (post.id ?? post.id ?? '').toString(),
      attributes: post as unknown as GetPostDto,
    });
    return new ControllerResponseDto(resource);
  }


  @UseGuards(OptionalJwtAuthGuard)
  @Get("getByDiscuit/:discuitId")
  @ApiOperation({ summary: 'Get posts by discuit' })
  @ApiParam({ name: 'discuitId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiOkResponse({ type: GetPostDto, isArray: true })
  async getByDiscuit(@Param('discuitId') discuitId: string, @Query('page') page: number, @Query('pageSize') pageSize: number,
    @GetUser() user: any): Promise<ControllerResponseDto<GetPostDto>> {
    const posts = await this.postsService.getByDiscuit(discuitId, page, pageSize, user?.userId);
    const resources = posts.data.map(post => new JsonApiResource<GetPostDto>({
      type: 'post',
      id: (post.id ?? '').toString(),
      attributes: post as unknown as GetPostDto,
    }));

    const meta = {
      total: posts.total.toString(),
      page: posts.page.toString(),
      pageSize: posts.pageSize.toString(),
      totalPages: posts.totalPages.toString(),
      hasNextPage: posts.hasNextPage.toString(),
      hasPreviousPage: posts.hasPreviousPage.toString(),
      nextPage: posts.nextPage !== null ? posts.nextPage.toString() : '',
      previousPage: posts.previousPage !== null ? posts.previousPage.toString() : '',
    };

    const links = {
      self: `/posts/getByDiscuit/${discuitId}?page=${meta.page}&pageSize=${meta.pageSize}`,
      first: `/posts/getByDiscuit/${discuitId}?page=1&pageSize=${meta.pageSize}`,
      last: `/posts/getByDiscuit/${discuitId}?page=${meta.totalPages}&pageSize=${meta.pageSize}`,
      next: posts.hasNextPage ? `/posts/getByDiscuit/${discuitId}?page=${meta.nextPage}&pageSize=${meta.pageSize}` : null,
      previous: posts.hasPreviousPage ? `/posts/getByDiscuit/${discuitId}?page=${meta.previousPage}&pageSize=${meta.pageSize}` : null,
    };
    return new ControllerResponseDto(resources, meta, links);
  }


  @UseGuards(OptionalJwtAuthGuard)
  @Get('homeFeed')
  @ApiOperation({ summary: 'Get home feed posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiOkResponse({ type: GetPostDto, isArray: true })
  async getHomeFeed(@Query('page') page: number, @Query('pageSize') pageSize: number,
    @GetUser() user: any): Promise<ControllerResponseDto<GetPostDto>> {
    const posts = await this.postsService.getHomeFeed(page, pageSize, user?.userId);
    const resources = posts.data.map(post => new JsonApiResource<GetPostDto>({
      type: 'post',
      id: (post.id ?? '').toString(),
      attributes: post as unknown as GetPostDto,
    }));
    const meta = {
      total: posts.total.toString(),
      page: posts.page.toString(),
      pageSize: posts.pageSize.toString(),
      totalPages: posts.totalPages.toString(),
      hasNextPage: posts.hasNextPage.toString(),
      hasPreviousPage: posts.hasPreviousPage.toString(),
      nextPage: posts.nextPage !== null ? posts.nextPage.toString() : '',
      previousPage: posts.previousPage !== null ? posts.previousPage.toString() : '',
    };  

    const links = {
      self: `/posts/homeFeed?page=${meta.page}&pageSize=${meta.pageSize}`,
      first: `/posts/homeFeed?page=1&pageSize=${meta.pageSize}`,
      last: `/posts/homeFeed?page=${meta.totalPages}&pageSize=${meta.pageSize}`,
      next: posts.hasNextPage ? `/posts/homeFeed?page=${meta.nextPage}&pageSize=${meta.pageSize}` : null,
      previous: posts.hasPreviousPage ? `/posts/homeFeed?page=${meta.previousPage}&pageSize=${meta.pageSize}` : null,
    };
    return new ControllerResponseDto(resources, meta, links);
  }


  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: GetPostDto })
  async getById(@Param('id') id: string, @GetUser() user: any): Promise<ControllerResponseDto<GetPostDto>> {
    const post = await this.postsService.getById(id, user?.userId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const resource = new JsonApiResource<GetPostDto>({
      type: 'post',
      id: (post.id ?? '').toString(),
      attributes: post as unknown as GetPostDto,
    });
    return new ControllerResponseDto(resource);
  }
}
