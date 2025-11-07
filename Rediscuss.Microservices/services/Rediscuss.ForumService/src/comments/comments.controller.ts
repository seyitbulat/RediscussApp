import { Body, Controller, Post, UseGuards, Get, Param, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/auth.guard';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GetCommentDto } from './dto/get-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from '../auth/user.decorator';
import { ControllerResponseDto } from '../common/dto/controller-response.dto';
import { JsonApiResource } from '../common/dto/api-response.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }


  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create a comment to any post" })
  @ApiBody({type: CreateCommentDto})
  @ApiOkResponse({ type: GetCommentDto })
  async create(@Body() createCommentDto: CreateCommentDto, @GetUser() user: any) {
    const comment = await this.commentsService.create(createCommentDto, user);
    const resource = new JsonApiResource<GetCommentDto>({
      type: 'comment',
      id: comment.id.toString(),
      attributes: comment,
    });
    return new ControllerResponseDto(resource);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('getByPost/:postId')
  @ApiOperation({ summary: 'Get comments by post' })
  @ApiParam({ name: 'postId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiOkResponse({ type: GetCommentDto, isArray: true })
  async getByPost(@Param('postId') postId: string, @Query('page') page: number, @Query('pageSize') pageSize: number, @GetUser() user: any) {
    const comments = await this.commentsService.getByPost(postId, page, pageSize, user?.userId);

    const resources = comments.data.map(comment => new JsonApiResource<GetCommentDto>({
      type: 'comment',
      id: (comment.id ?? '').toString(),
      attributes: comment,
    }));

    const meta = {
      total: comments.total.toString(),
      page: comments.page.toString(),
      pageSize: comments.pageSize.toString(),
      totalPages: comments.totalPages.toString(),
      hasNextPage: comments.hasNextPage.toString(),
      hasPreviousPage: comments.hasPreviousPage.toString(),
      nextPage: comments.nextPage !== null ? comments.nextPage.toString() : '',
      previousPage: comments.previousPage !== null ? comments.previousPage.toString() : '',
    };

    const links = {
      self: `/comments/getByPost/${postId}?page=${meta.page}&pageSize=${meta.pageSize}`,
      first: `/comments/getByPost/${postId}?page=1&pageSize=${meta.pageSize}`,
      last: `/comments/getByPost/${postId}?page=${meta.totalPages}&pageSize=${meta.pageSize}`,
      next: comments.hasNextPage ? `/comments/getByPost/${postId}?page=${meta.nextPage}&pageSize=${meta.pageSize}` : '',
      previous: comments.hasPreviousPage ? `/comments/getByPost/${postId}?page=${meta.previousPage}&pageSize=${meta.pageSize}` : '',
    };

    return new ControllerResponseDto(resources, links, meta);
  }
}
