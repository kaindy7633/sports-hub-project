// src/modules/activities/activity-teams.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { Team } from '../teams/entities/team.entity';
import { ActivityTeam } from './entities/activity-team.entity';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { InsufficientPermissionException } from '../../common/exceptions/insufficient-permission.exception';

@Injectable()
export class ActivityTeamsService {
  private readonly logger = new Logger(ActivityTeamsService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(ActivityTeam)
    private readonly activityTeamRepository: Repository<ActivityTeam>,
  ) {}

  /**
   * 将团队添加到活动
   * @param activityId 业务活动ID
   * @param teamId 业务团队ID
   * @param role 团队在活动中的角色
   * @param isHost 是否是主办方
   * @param operatorId 操作者ID
   * @param isAdmin 是否是管理员
   */
  async addTeamToActivity(
    activityId: string,
    teamId: string,
    role: string,
    isHost: boolean,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<ActivityTeam> {
    try {
      // 查找活动
      const activity = await this.activityRepository.findOne({
        where: { activity_id: activityId },
      });

      if (!activity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 检查是否已经关联
      const existingRelation = await this.activityTeamRepository.findOne({
        where: { activity_id: activity.id, team_id: team.id },
      });

      if (existingRelation) {
        throw new BadRequestException(
          `团队 ${teamId} 已经关联到活动 ${activityId}`,
        );
      }

      // 检查权限（活动创建者、团队队长或管理员可以添加）
      const isActivityCreator = activity.creator_id.toString() === operatorId;
      const isTeamLeader = team.leader_id.toString() === operatorId;

      if (!isActivityCreator && !isTeamLeader && !isAdmin) {
        throw new InsufficientPermissionException('活动团队', '添加');
      }

      // 创建关联
      const activityTeam = this.activityTeamRepository.create({
        activity_id: activity.id,
        team_id: team.id,
        role,
        is_host: isHost,
        joined_at: new Date(),
      });

      return await this.activityTeamRepository.save(activityTeam);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`添加团队到活动失败: ${error.message}`, error.stack);
      throw new DatabaseException('添加', '活动团队关联', error);
    }
  }

  /**
   * 从活动中移除团队
   * @param activityId 业务活动ID
   * @param teamId 业务团队ID
   * @param operatorId 操作者ID
   * @param isAdmin 是否是管理员
   */
  async removeTeamFromActivity(
    activityId: string,
    teamId: string,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<void> {
    try {
      // 查找活动
      const activity = await this.activityRepository.findOne({
        where: { activity_id: activityId },
      });

      if (!activity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 检查关联是否存在
      const relation = await this.activityTeamRepository.findOne({
        where: { activity_id: activity.id, team_id: team.id },
      });

      if (!relation) {
        throw new BadRequestException(
          `团队 ${teamId} 未关联到活动 ${activityId}`,
        );
      }

      // 检查权限（活动创建者、团队队长或管理员可以移除）
      const isActivityCreator = activity.creator_id.toString() === operatorId;
      const isTeamLeader = team.leader_id.toString() === operatorId;

      if (!isActivityCreator && !isTeamLeader && !isAdmin) {
        throw new InsufficientPermissionException('活动团队', '移除');
      }

      // 移除关联
      await this.activityTeamRepository.delete({
        activity_id: activity.id,
        team_id: team.id,
      });
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`从活动移除团队失败: ${error.message}`, error.stack);
      throw new DatabaseException('移除', '活动团队关联', error);
    }
  }

  /**
   * 获取活动的所有团队
   * @param activityId 业务活动ID
   */
  async getActivityTeams(activityId: string): Promise<any[]> {
    try {
      // 查找活动
      const activity = await this.activityRepository.findOne({
        where: { activity_id: activityId },
      });

      if (!activity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      // 查询活动的所有团队
      const teams = await this.activityTeamRepository.query(
        `
        SELECT at.role, at.is_host, at.joined_at, 
          t.team_id, t.name, t.logo, t.description, t.current_members, t.status
        FROM activity_team at
        JOIN teams t ON at.team_id = t.id
        WHERE at.activity_id = $1 AND t.deleted_at IS NULL
        ORDER BY at.is_host DESC, at.joined_at
      `,
        [activity.id],
      );

      return teams;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`获取活动团队列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '活动团队列表', error);
    }
  }

  /**
   * 获取团队参与的所有活动
   * @param teamId 业务团队ID
   * @param queryParams 查询参数
   */
  async getTeamActivities(teamId: string, queryParams: any = {}): Promise<any> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      const {
        pageNum = 1,
        pageSize = 10,
        status,
        start_date,
        end_date,
      } = queryParams;

      // 将 skip 转换为 BigInt 类型
      const skip = BigInt((pageNum - 1) * pageSize);

      // 构建查询SQL
      let sql = `
        SELECT at.role, at.is_host, at.joined_at, 
          a.activity_id, a.title, a.description, a.start_time, a.end_time, 
          a.max_participants, a.current_participants, a.fee, a.status,
          COUNT(*) OVER() as total_count
        FROM activity_team at
        JOIN activities a ON at.activity_id = a.id
        WHERE at.team_id = $1 AND a.deleted_at IS NULL
      `;

      const params = [team.id];
      let paramCount = 2;

      // 添加过滤条件
      if (status !== undefined) {
        sql += ` AND a.status = $${paramCount++}`;
        params.push(status);
      }

      if (start_date) {
        sql += ` AND a.start_time >= $${paramCount++}`;
        params.push(start_date);
      }

      if (end_date) {
        sql += ` AND a.start_time <= $${paramCount++}`;
        params.push(end_date);
      }

      // 添加排序和分页
      sql += ` 
        ORDER BY a.start_time DESC
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;

      // 将 pageSize 也转换为 BigInt 类型
      params.push(BigInt(pageSize), skip);

      // 执行查询
      const activities = await this.activityTeamRepository.query(sql, params);

      // 提取总数
      const total =
        activities.length > 0 ? parseInt(activities[0].total_count) : 0;

      return {
        list: activities.map((a) => {
          const { total_count, ...activity } = a;
          return activity;
        }),
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`获取团队活动列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队活动列表', error);
    }
  }

  /**
   * 更新团队在活动中的角色
   * @param activityId 业务活动ID
   * @param teamId 业务团队ID
   * @param role 新角色
   * @param isHost 是否是主办方
   * @param operatorId 操作者ID
   * @param isAdmin 是否是管理员
   */
  async updateTeamRole(
    activityId: string,
    teamId: string,
    role: string,
    isHost: boolean,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<ActivityTeam> {
    try {
      // 查找活动
      const activity = await this.activityRepository.findOne({
        where: { activity_id: activityId },
      });

      if (!activity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 检查关联是否存在
      const relation = await this.activityTeamRepository.findOne({
        where: { activity_id: activity.id, team_id: team.id },
      });

      if (!relation) {
        throw new BadRequestException(
          `团队 ${teamId} 未关联到活动 ${activityId}`,
        );
      }

      // 检查权限（活动创建者或管理员可以更新角色）
      const isActivityCreator = activity.creator_id.toString() === operatorId;

      if (!isActivityCreator && !isAdmin) {
        throw new InsufficientPermissionException('活动团队角色', '更新');
      }

      // 更新角色
      relation.role = role;
      relation.is_host = isHost;

      return await this.activityTeamRepository.save(relation);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(
        `更新团队在活动中的角色失败: ${error.message}`,
        error.stack,
      );
      throw new DatabaseException('更新', '活动团队角色', error);
    }
  }
}
