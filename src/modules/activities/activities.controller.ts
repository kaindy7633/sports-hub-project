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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('activities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('admin', 'user')
  @ApiOperation({ summary: '创建活动' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '活动创建成功',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  create(@Body() createActivityDto: CreateActivityDto, @Request() req) {
    // 从JWT中获取创建者ID
    const creator_id = req.user.userId;
    return this.activitiesService.create(createActivityDto, creator_id);
  }

  @Get()
  @ApiOperation({ summary: '分页查询活动列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动列表',
  })
  findAll(@Query() query: QueryActivityDto) {
    return this.activitiesService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我创建的活动' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回我创建的活动列表',
  })
  findMyActivities(@Request() req, @Query() query: QueryActivityDto) {
    const creator_id = req.user.userId;
    return this.activitiesService.findMyActivities(creator_id, query);
  }

  @Get(':activityId')
  @ApiOperation({ summary: '根据业务ID获取活动详情' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动详情',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  findOne(@Param('activityId') activityId: string) {
    return this.activitiesService.findOne(activityId);
  }

  @Patch(':activityId')
  @UseGuards(RoleGuard)
  @Roles('admin', 'user')
  @ApiOperation({ summary: '更新活动信息' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '活动更新成功',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限修改该活动',
  })
  async update(
    @Param('activityId') activityId: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() req,
  ) {
    // 检查是否有权限修改（创建者或管理员）
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    return this.activitiesService.update(
      activityId,
      updateActivityDto,
      userId,
      isAdmin,
    );
  }

  @Delete(':activityId')
  @UseGuards(RoleGuard)
  @Roles('admin', 'user')
  @ApiOperation({ summary: '删除活动' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '活动删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限删除该活动',
  })
  async remove(@Param('activityId') activityId: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    return this.activitiesService.remove(activityId, userId, isAdmin);
  }

  @Post(':activityId/join')
  @ApiOperation({ summary: '参加活动' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功参加活动' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '活动已达到最大参与人数',
  })
  joinActivity(@Param('activityId') activityId: string, @Request() req) {
    const userId = req.user.userId;
    return this.activitiesService.joinActivity(activityId, userId);
  }

  @Post(':activityId/leave')
  @ApiOperation({ summary: '退出活动' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功退出活动' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '活动不存在或未参加该活动',
  })
  leaveActivity(@Param('activityId') activityId: string, @Request() req) {
    const userId = req.user.userId;
    return this.activitiesService.leaveActivity(activityId, userId);
  }
}
