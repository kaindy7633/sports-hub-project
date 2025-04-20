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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';
import { PAGINATION } from '../../common/constants';

@ApiTags('消息(messages)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: '发送消息' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '消息发送成功',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    // 从JWT中获取发送者ID
    const sender_id = req.user.userId;
    return this.messagesService.create(createMessageDto, sender_id);
  }

  @Get()
  @ApiOperation({ summary: '分页查询消息列表' })
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
    description: '返回消息列表',
  })
  findAll(@Query() query: QueryMessageDto) {
    return this.messagesService.findAll(query);
  }

  @Get('inbox')
  @ApiOperation({ summary: '获取我的收件箱' })
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
    description: '返回收件箱消息列表',
  })
  findInbox(@Request() req, @Query() query: QueryMessageDto) {
    const userId = req.user.userId;
    return this.messagesService.findInbox(userId, query);
  }

  @Get('outbox')
  @ApiOperation({ summary: '获取我的发件箱' })
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
    description: '返回发件箱消息列表',
  })
  findOutbox(@Request() req, @Query() query: QueryMessageDto) {
    const userId = req.user.userId;
    return this.messagesService.findOutbox(userId, query);
  }

  @Get('unread')
  @ApiOperation({ summary: '获取未读消息数量' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回未读消息数量',
  })
  getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    return this.messagesService.getUnreadCount(userId);
  }

  @Get(':messageId')
  @ApiOperation({ summary: '根据业务ID获取消息详情' })
  @ApiParam({ name: 'messageId', description: '业务消息ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回消息详情',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '消息不存在' })
  findOne(@Param('messageId') messageId: string, @Request() req) {
    const userId = req.user.userId;
    return this.messagesService.findOne(messageId, userId);
  }

  @Patch(':messageId/read')
  @ApiOperation({ summary: '标记消息为已读' })
  @ApiParam({ name: 'messageId', description: '业务消息ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '消息标记为已读',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '消息不存在' })
  markAsRead(@Param('messageId') messageId: string, @Request() req) {
    const userId = req.user.userId;
    return this.messagesService.markAsRead(messageId, userId);
  }

  @Delete(':messageId')
  @ApiOperation({ summary: '删除消息' })
  @ApiParam({ name: 'messageId', description: '业务消息ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '消息删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '消息不存在' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限删除该消息',
  })
  remove(@Param('messageId') messageId: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.messagesService.remove(messageId, userId, isAdmin);
  }
}
