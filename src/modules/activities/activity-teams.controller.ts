// src/modules/activities/activity-teams.controller.ts
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
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ActivityTeamsService } from './activity-teams.service';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';
import { PAGINATION } from '../../common/constants';

@ApiTags('活动团队(activity-teams)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityTeamsController {
  constructor(private readonly activityTeamsService: ActivityTeamsService) {}

  @Post(':activityId/teams/:teamId')
  @ApiOperation({ summary: '添加团队到活动' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          example: 'host',
          description: '团队在活动中的角色',
        },
        isHost: { type: 'boolean', example: true, description: '是否是主办方' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '团队添加到活动成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '团队已关联到活动',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '活动或团队不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async addTeamToActivity(
    @Param('activityId') activityId: string,
    @Param('teamId') teamId: string,
    @Body('role') role: string,
    @Body('isHost') isHost: boolean,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const result = await this.activityTeamsService.addTeamToActivity(
      activityId,
      teamId,
      role,
      isHost,
      operatorId,
      isAdmin,
    );

    return {
      code: 201,
      data: result,
      msg: '团队添加到活动成功',
    };
  }

  @Delete(':activityId/teams/:teamId')
  @ApiOperation({ summary: '从活动中移除团队' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '从活动移除团队成功' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '团队未关联到活动',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '活动或团队不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async removeTeamFromActivity(
    @Param('activityId') activityId: string,
    @Param('teamId') teamId: string,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    await this.activityTeamsService.removeTeamFromActivity(
      activityId,
      teamId,
      operatorId,
      isAdmin,
    );

    return {
      code: 200,
      data: null,
      msg: '从活动移除团队成功',
    };
  }

  @Get(':activityId/teams')
  @ApiOperation({ summary: '获取活动的所有团队' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动的所有团队',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动不存在' })
  async getActivityTeams(@Param('activityId') activityId: string) {
    return {
      code: 200,
      data: await this.activityTeamsService.getActivityTeams(activityId),
      msg: 'success',
    };
  }

  @Patch(':activityId/teams/:teamId/role')
  @ApiOperation({ summary: '更新团队在活动中的角色' })
  @ApiParam({ name: 'activityId', description: '业务活动ID' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'guest', description: '新角色' },
        isHost: {
          type: 'boolean',
          example: false,
          description: '是否是主办方',
        },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '团队角色更新成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '团队未关联到活动',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '活动或团队不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async updateTeamRole(
    @Param('activityId') activityId: string,
    @Param('teamId') teamId: string,
    @Body('role') role: string,
    @Body('isHost') isHost: boolean,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    const result = await this.activityTeamsService.updateTeamRole(
      activityId,
      teamId,
      role,
      isHost,
      operatorId,
      isAdmin,
    );

    return {
      code: 200,
      data: result,
      msg: '团队角色更新成功',
    };
  }

  @Get('/team/:teamId')
  @ApiOperation({ summary: '获取团队参与的所有活动' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: '活动状态',
    required: false,
    enum: ['pending', 'active', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'start_date',
    description: '开始日期',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'end_date',
    description: '结束日期',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回团队参与的所有活动',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '团队不存在' })
  async getTeamActivities(
    @Param('teamId') teamId: string,
    @Query() queryParams,
  ) {
    return {
      code: 200,
      data: await this.activityTeamsService.getTeamActivities(
        teamId,
        queryParams,
      ),
      msg: 'success',
    };
  }
}
