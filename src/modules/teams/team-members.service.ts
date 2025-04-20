// src/modules/teams/team-members.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { UserTeam } from './entities/user-team.entity';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { InsufficientPermissionException } from '../../common/exceptions/insufficient-permission.exception';

@Injectable()
export class TeamMembersService {
  private readonly logger = new Logger(TeamMembersService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTeam)
    private readonly userTeamRepository: Repository<UserTeam>,
  ) {}

  /**
   * 添加用户到团队
   * @param teamId 业务团队ID
   * @param userId 业务用户ID
   * @param role 用户在团队中的角色
   * @returns
   */
  async addUserToTeam(
    teamId: string,
    userId: string,
    role?: string,
  ): Promise<UserTeam> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 检查用户是否已经是团队成员
      const existingMember = await this.userTeamRepository.findOne({
        where: { user_id: user.id, team_id: team.id },
      });

      if (existingMember) {
        throw new BadRequestException(
          `用户 ${userId} 已经是团队 ${teamId} 的成员`,
        );
      }

      // 检查团队是否已达到最大成员数
      if (team.max_members > 0 && team.current_members >= team.max_members) {
        throw new BadRequestException(`团队 ${teamId} 已达到最大成员数`);
      }

      // 创建用户-团队关联
      const userTeam = this.userTeamRepository.create({
        user_id: user.id,
        team_id: team.id,
        role: role || 'member',
        joined_at: new Date(),
      });

      // 保存关联关系
      const savedUserTeam = await this.userTeamRepository.save(userTeam);

      // 更新团队当前成员数
      team.current_members += 1;
      await this.teamRepository.save(team);

      return savedUserTeam;
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`添加团队成员失败: ${error.message}`, error.stack);
      throw new DatabaseException('添加', '团队成员', error);
    }
  }

  /**
   * 从团队中移除用户
   * @param teamId 业务团队ID
   * @param userId 业务用户ID
   * @param operatorId 操作者ID
   * @param isAdmin 操作者是否为管理员
   */
  async removeUserFromTeam(
    teamId: string,
    userId: string,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<void> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 检查用户是否是团队成员
      const membership = await this.userTeamRepository.findOne({
        where: { user_id: user.id, team_id: team.id },
      });

      if (!membership) {
        throw new BadRequestException(
          `用户 ${userId} 不是团队 ${teamId} 的成员`,
        );
      }

      // 检查权限（只有团队队长、管理员或用户自己可以移除用户）
      if (
        team.leader_id.toString() !== operatorId &&
        user.user_id !== operatorId &&
        !isAdmin
      ) {
        throw new InsufficientPermissionException('团队成员', '移除');
      }

      // 如果是队长要退出，需要先转移队长权限
      if (team.leader_id.toString() === userId) {
        throw new BadRequestException('队长不能直接退出团队，请先转移队长权限');
      }

      // 删除关联关系
      await this.userTeamRepository.delete({
        user_id: user.id,
        team_id: team.id,
      });

      // 更新团队当前成员数
      if (team.current_members > 0) {
        team.current_members -= 1;
        await this.teamRepository.save(team);
      }
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`移除团队成员失败: ${error.message}`, error.stack);
      throw new DatabaseException('移除', '团队成员', error);
    }
  }

  /**
   * 获取团队成员列表
   * @param teamId 业务团队ID
   * @returns 成员列表
   */
  async getTeamMembers(teamId: string): Promise<any[]> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 使用原始SQL查询，避免类型转换问题
      const members = await this.userTeamRepository.query(
        `
        SELECT ut.role, ut.joined_at, 
          u.user_id, u.username, u.nick_name, u.real_name, u.avatar, u.email, u.phone
        FROM user_team ut
        JOIN users u ON ut.user_id = u.id
        WHERE ut.team_id = $1 AND u.deleted_at IS NULL
        ORDER BY CASE WHEN ut.role = 'leader' THEN 0 ELSE 1 END, ut.joined_at
      `,
        [team.id],
      );

      return members;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`获取团队成员列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队成员列表', error);
    }
  }

  /**
   * 获取用户加入的团队列表
   * @param userId 业务用户ID
   * @returns 团队列表
   */
  async getUserTeams(userId: string): Promise<any[]> {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 使用原始SQL查询，避免类型转换问题
      const teams = await this.userTeamRepository.query(
        `
        SELECT ut.role, ut.joined_at, 
          t.team_id, t.name, t.logo, t.description, t.current_members, t.status
        FROM user_team ut
        JOIN teams t ON ut.team_id = t.id
        WHERE ut.user_id = $1 AND t.deleted_at IS NULL
        ORDER BY ut.joined_at DESC
      `,
        [user.id],
      );

      return teams;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`获取用户团队列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '用户团队列表', error);
    }
  }

  /**
   * 更新用户在团队中的角色
   * @param teamId 业务团队ID
   * @param userId 业务用户ID
   * @param role 新角色
   * @param operatorId 操作者ID
   * @param isAdmin 操作者是否为管理员
   */
  async updateUserRole(
    teamId: string,
    userId: string,
    role: string,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<UserTeam> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 检查用户是否是团队成员
      const membership = await this.userTeamRepository.findOne({
        where: { user_id: user.id, team_id: team.id },
      });

      if (!membership) {
        throw new BadRequestException(
          `用户 ${userId} 不是团队 ${teamId} 的成员`,
        );
      }

      // 检查权限（只有团队队长或管理员可以更新角色）
      if (team.leader_id.toString() !== operatorId && !isAdmin) {
        throw new InsufficientPermissionException('团队成员角色', '更新');
      }

      // 更新角色
      membership.role = role;
      return await this.userTeamRepository.save(membership);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`更新团队成员角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '团队成员角色', error);
    }
  }

  /**
   * 转移团队队长权限
   * @param teamId 业务团队ID
   * @param newLeaderId 新队长的业务ID
   * @param operatorId 操作者ID
   * @param isAdmin 操作者是否为管理员
   */
  async transferTeamLeadership(
    teamId: string,
    newLeaderId: string,
    operatorId: string,
    isAdmin: boolean,
  ): Promise<Team> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 查找新队长
      const newLeader = await this.userRepository.findOne({
        where: { user_id: newLeaderId },
      });

      if (!newLeader) {
        throw new ResourceNotFoundException('用户', newLeaderId);
      }

      // 检查新队长是否是团队成员
      const membership = await this.userTeamRepository.findOne({
        where: { user_id: newLeader.id, team_id: team.id },
      });

      if (!membership) {
        throw new BadRequestException(
          `用户 ${newLeaderId} 不是团队 ${teamId} 的成员`,
        );
      }

      // 检查权限（只有现任队长或管理员可以转移队长权限）
      if (team.leader_id.toString() !== operatorId && !isAdmin) {
        throw new InsufficientPermissionException('团队队长权限', '转移');
      }

      // 如果新队长与现任队长相同，无需操作
      if (team.leader_id.toString() === newLeaderId) {
        return team;
      }

      // 获取当前队长的成员资格
      const oldLeader = await this.userRepository.findOne({
        where: { id: team.leader_id },
      });

      if (oldLeader) {
        const oldLeaderMembership = await this.userTeamRepository.findOne({
          where: { user_id: oldLeader.id, team_id: team.id },
        });

        if (oldLeaderMembership) {
          // 将旧队长角色改为普通成员
          oldLeaderMembership.role = 'member';
          await this.userTeamRepository.save(oldLeaderMembership);
        }
      }

      // 将新队长角色设置为 'leader'
      membership.role = 'leader';
      await this.userTeamRepository.save(membership);

      // 更新团队队长ID
      team.leader_id = newLeader.id;
      return await this.teamRepository.save(team);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`转移团队队长权限失败: ${error.message}`, error.stack);
      throw new DatabaseException('转移', '团队队长权限', error);
    }
  }

  /**
   * 检查用户是否是团队成员
   * @param teamId 业务团队ID
   * @param userId 业务用户ID
   * @returns 是否是团队成员
   */
  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        return false;
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        return false;
      }

      // 检查用户是否是团队成员
      const membership = await this.userTeamRepository.findOne({
        where: { user_id: user.id, team_id: team.id },
      });

      return !!membership;
    } catch (error) {
      this.logger.error(
        `检查用户是否是团队成员失败: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * 获取用户在团队中的角色
   * @param teamId 业务团队ID
   * @param userId 业务用户ID
   * @returns 用户在团队中的角色，如果不是成员则返回null
   */
  async getUserRoleInTeam(
    teamId: string,
    userId: string,
  ): Promise<string | null> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        return null;
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        return null;
      }

      // 检查用户是否是团队成员
      const membership = await this.userTeamRepository.findOne({
        where: { user_id: user.id, team_id: team.id },
      });

      return membership ? membership.role : null;
    } catch (error) {
      this.logger.error(
        `获取用户在团队中的角色失败: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * 批量添加用户到团队
   * @param teamId 业务团队ID
   * @param userIds 业务用户ID数组
   * @param role 角色
   * @returns 添加成功的用户数量
   */
  async addUsersToTeam(
    teamId: string,
    userIds: string[],
    role: string = 'member',
  ): Promise<number> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 检查团队是否已达到最大成员数
      if (
        team.max_members > 0 &&
        team.current_members + userIds.length > team.max_members
      ) {
        throw new BadRequestException(
          `添加这么多成员会超过团队 ${teamId} 的最大成员数限制`,
        );
      }

      let successCount = 0;

      // 逐个添加用户
      for (const userId of userIds) {
        try {
          // 查找用户
          const user = await this.userRepository.findOne({
            where: { user_id: userId },
          });

          if (!user) {
            this.logger.warn(`用户 ${userId} 不存在，跳过添加`);
            continue;
          }

          // 检查用户是否已经是团队成员
          const existingMember = await this.userTeamRepository.findOne({
            where: { user_id: user.id, team_id: team.id },
          });

          if (existingMember) {
            this.logger.warn(
              `用户 ${userId} 已经是团队 ${teamId} 的成员，跳过添加`,
            );
            continue;
          }

          // 创建用户-团队关联
          const userTeam = this.userTeamRepository.create({
            user_id: user.id,
            team_id: team.id,
            role: role,
            joined_at: new Date(),
          });

          // 保存关联关系
          await this.userTeamRepository.save(userTeam);
          successCount++;
        } catch (error) {
          this.logger.error(
            `添加用户 ${userId} 到团队 ${teamId} 失败: ${error.message}`,
            error.stack,
          );
          // 继续处理下一个用户
        }
      }

      // 更新团队当前成员数
      if (successCount > 0) {
        team.current_members += successCount;
        await this.teamRepository.save(team);
      }

      return successCount;
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`批量添加团队成员失败: ${error.message}`, error.stack);
      throw new DatabaseException('批量添加', '团队成员', error);
    }
  }

  /**
   * 获取团队队长信息
   * @param teamId 业务团队ID
   * @returns 队长信息
   */
  async getTeamLeader(teamId: string): Promise<any> {
    try {
      // 查找团队
      const team = await this.teamRepository.findOne({
        where: { team_id: teamId },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', teamId);
      }

      // 查询队长信息
      const leaderInfo = await this.userRepository.query(
        `
        SELECT u.user_id, u.username, u.nick_name, u.real_name, u.avatar, u.email, u.phone
        FROM users u
        WHERE u.id = $1 AND u.deleted_at IS NULL
      `,
        [team.leader_id],
      );

      if (leaderInfo.length === 0) {
        return null;
      }

      return leaderInfo[0];
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`获取团队队长信息失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队队长信息', error);
    }
  }

  /**
   * 统计用户加入的团队数量
   * @param userId 业务用户ID
   * @returns 用户加入的团队数量
   */
  async countUserTeams(userId: string): Promise<number> {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      // 统计用户加入的团队数量
      const count = await this.userTeamRepository.count({
        where: { user_id: user.id },
      });

      return count;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(
        `统计用户加入的团队数量失败: ${error.message}`,
        error.stack,
      );
      throw new DatabaseException('统计', '用户团队数量', error);
    }
  }
}
