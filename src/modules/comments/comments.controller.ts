import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';
import { PAGINATION } from '../../common/constants';

@ApiTags('评论(comments)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '发表评论' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '评论发表成功',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    // 从JWT中获取用户ID
    const user_id = req.user.userId;
    return this.commentsService.create(createCommentDto, user_id);
  }

  @Get()
  @ApiOperation({ summary: '分页查询评论列表' })
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    example: PAGINATION.DEFAULT_PAGE_NUM,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    example: PAGINATION.DEFAULT_PAGE_SIZE,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回评论列表',
  })
  findAll(@Query() query: QueryCommentDto) {
    return this.commentsService.findAll(query);
  }

  @Get('activity/:activityId')
  @ApiOperation({ summary: '获取活动的评论列表' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    example: PAGINATION.DEFAULT_PAGE_NUM,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    example: PAGINATION.DEFAULT_PAGE_SIZE,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动评论列表',
  })
  findActivityComments(
    @Param('activityId') activityId: string,
    @Query() query: QueryCommentDto,
  ) {
    // 设置活动ID，然后复用findAll方法
    const params = { ...query, activity_id: activityId };
    return this.commentsService.findAll(params);
  }

  @Get('user')
  @ApiOperation({ summary: '获取我发表的评论' })
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    example: PAGINATION.DEFAULT_PAGE_NUM,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    example: PAGINATION.DEFAULT_PAGE_SIZE,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回我的评论列表',
  })
  findMyComments(@Request() req, @Query() query: QueryCommentDto) {
    const user_id = req.user.userId;
    // 设置用户ID，然后复用findAll方法
    const params = { ...query, user_id };
    return this.commentsService.findAll(params);
  }

  @Get(':commentId')
  @ApiOperation({ summary: '根据业务ID获取评论详情' })
  @ApiParam({ name: 'commentId', description: '业务评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回评论详情',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '评论不存在' })
  findOne(@Param('commentId') commentId: string) {
    return this.commentsService.findOne(commentId);
  }

  @Patch(':commentId')
  @ApiOperation({ summary: '更新评论' })
  @ApiParam({ name: 'commentId', description: '业务评论ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '评论更新成功',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '评论不存在' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限更新该评论',
  })
  update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.commentsService.update(
      commentId,
      updateCommentDto,
      userId,
      isAdmin,
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: '删除评论' })
  @ApiParam({ name: 'commentId', description: '业务评论ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '评论删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '评论不存在' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限删除该评论',
  })
  remove(@Param('commentId') commentId: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.commentsService.remove(commentId, userId, isAdmin);
  }

  @Post(':commentId/like')
  @ApiOperation({ summary: '点赞评论' })
  @ApiParam({ name: 'commentId', description: '业务评论ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '点赞成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '评论不存在' })
  likeComment(@Param('commentId') commentId: string) {
    return this.commentsService.likeComment(commentId);
  }
}
