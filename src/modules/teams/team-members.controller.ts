// src/modules/teams/team-members.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
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
  ApiBody,
} from '@nestjs/swagger';
import { TeamMembersService } from './team-members.service';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('团队成员(team-members)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post(':teamId/members/:userId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: '添加成员到团队' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          example: 'member',
          description: '用户在团队中的角色',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '成员添加成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效或用户已是团队成员',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '团队或用户不存在',
  })
  async addMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body('role') role?: string,
  ) {
    return this.teamMembersService.addUserToTeam(teamId, userId, role);
  }

  @Delete(':teamId/members/:userId')
  @ApiOperation({ summary: '从团队中移除成员' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '成员移除成功' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效或用户不是团队成员',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '团队或用户不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    await this.teamMembersService.removeUserFromTeam(
      teamId,
      userId,
      operatorId,
      isAdmin,
    );
    return { message: '成员移除成功' };
  }

  @Get(':teamId/members')
  @ApiOperation({ summary: '获取团队成员列表' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回团队成员列表',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '团队不存在' })
  async getTeamMembers(@Param('teamId') teamId: string) {
    return {
      code: 200,
      data: await this.teamMembersService.getTeamMembers(teamId),
      msg: 'success',
    };
  }

  @Get('users/:userId')
  @ApiOperation({ summary: '获取用户加入的团队列表' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回用户加入的团队列表',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '用户不存在' })
  async getUserTeams(@Param('userId') userId: string) {
    return {
      code: 200,
      data: await this.teamMembersService.getUserTeams(userId),
      msg: 'success',
    };
  }

  @Patch(':teamId/members/:userId/role')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: '更新团队成员角色' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'admin', description: '新角色' },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成员角色更新成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效或用户不是团队成员',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '团队或用户不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.teamMembersService.updateUserRole(
      teamId,
      userId,
      role,
      operatorId,
      isAdmin,
    );
  }

  @Post(':teamId/transfer-leadership/:userId')
  @ApiOperation({ summary: '转移团队队长权限' })
  @ApiParam({ name: 'teamId', description: '业务团队ID' })
  @ApiParam({ name: 'userId', description: '新队长的业务ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '队长权限转移成功',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数无效或用户不是团队成员',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '团队或用户不存在',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '没有权限执行此操作',
  })
  async transferLeadership(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const operatorId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.teamMembersService.transferTeamLeadership(
      teamId,
      userId,
      operatorId,
      isAdmin,
    );
  }
}
