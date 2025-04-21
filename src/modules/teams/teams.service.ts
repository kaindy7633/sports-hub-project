import { Injectable, Logger, Inject, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { PAGINATION, STATUS } from '../../common/constants';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

/**
 * 团队服务类
 *
 * 提供团队相关的业务逻辑处理，包括创建、查询、更新和删除团队等功能。
 * 使用TypeORM进行数据库操作，并处理相关异常。
 */
@Injectable({ scope: Scope.REQUEST }) // 修改为请求作用域
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  /**
   * 构造函数
   *
   * @param teamRepository - 团队数据库操作仓库
   * @param snowflakeService - 雪花算法服务，用于生成唯一ID
   * @param request - 当前请求对象，用于获取用户信息
   * @param dataSource - 数据源，用于创建事务
   */
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly snowflakeService: SnowflakeService,
    @Inject(REQUEST) private readonly request: any, // 注入请求对象
    private dataSource: DataSource, // 注入数据源，用于事务处理
  ) {}

  /**
   * 创建新团队
   *
   * 根据提供的DTO数据创建新的团队记录。
   * 使用雪花算法生成唯一的团队ID，并将当前用户设置为团队领导者。
   * 同时将创建者添加为团队成员，并更新团队成员计数。
   *
   * @param createTeamDto - 包含团队信息的数据传输对象
   * @returns 返回创建成功的团队实体
   * @throws DatabaseException 当数据库操作失败时抛出异常
   */
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // 创建查询运行器以支持事务
    const queryRunner = this.dataSource.createQueryRunner();

    // 开始事务
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 从请求对象中获取当前用户ID，并增加容错处理
      if (!this.request || !this.request.user || !this.request.user.userId) {
        this.logger.error('创建团队失败: 无法获取当前用户ID');
        throw new Error('无法获取当前用户信息，请重新登录');
      }

      // 从请求对象中获取当前用户ID
      const currentUserId = this.request.user.userId;

      // 生成业务团队ID（使用雪花算法）
      const team_id = this.snowflakeService.generate();

      // 创建团队实体，设置团队ID和领导者ID，初始成员数为1（团长自己）
      const team = this.teamRepository.create({
        ...createTeamDto,
        team_id,
        leader_id: currentUserId,
        current_members: 1, // 设置初始成员数为1（团长）
      });

      // 保存团队信息
      const savedTeam = await queryRunner.manager.save(team);

      // 确保ID值有效
      if (!currentUserId || !team.id) {
        throw new Error('用户ID或团队ID无效，无法创建团队成员关系');
      }

      // 在user_team表中添加记录，将团长添加为团队成员
      await queryRunner.manager.query(
        `INSERT INTO user_team (user_id, team_id, role, joined_at, created_at, updated_at) 
         VALUES ($1, $2, 'leader', NOW(), NOW(), NOW())`,
        [currentUserId, team.team_id], // 使用业务ID而不是内部ID
      );

      // 提交事务
      await queryRunner.commitTransaction();

      return savedTeam;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();

      this.logger.error(`创建团队失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '团队', error);
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  /**
   * 查询团队列表
   *
   * 根据查询参数获取团队列表，支持分页、按名称和状态筛选。
   *
   * @param queryParams - 查询参数，包含名称、状态、页码和每页条数等
   * @returns 返回团队列表、总数和分页信息
   * @throws DatabaseException 当数据库操作失败时抛出异常
   */
  async findAll(queryParams: QueryTeamDto = {}) {
    try {
      const {
        name,
        status,
        pageNum = PAGINATION.DEFAULT_PAGE_NUM,
        pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
      } = queryParams;

      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const queryBuilder = this.teamRepository.createQueryBuilder('team');

      // 添加查询条件
      if (name) {
        queryBuilder.andWhere('team.name LIKE :name', { name: `%${name}%` });
      }

      if (status !== undefined) {
        queryBuilder.andWhere('team.status = :status', { status });
      }

      // 获取总数
      const total = await queryBuilder.getCount();

      // 分页查询
      const teams = await queryBuilder
        .orderBy('team.createdAt', 'DESC')
        .skip(skip)
        .take(pageSize)
        .getMany();

      return {
        list: teams,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询团队列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队列表', error);
    }
  }

  /**
   * 查询单个团队详情
   *
   * 根据团队ID获取团队详细信息。
   *
   * @param id - 团队ID
   * @returns 返回团队实体
   * @throws ResourceNotFoundException 当团队不存在时抛出异常
   * @throws DatabaseException 当数据库操作失败时抛出异常
   */
  async findOne(id: string): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({
        where: { team_id: id },
      });

      if (!team) {
        throw new ResourceNotFoundException('团队', id);
      }

      return team;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询团队详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队', error);
    }
  }

  /**
   * 更新团队信息
   *
   * 根据团队ID和更新数据修改团队信息。
   *
   * @param id - 团队ID
   * @param updateTeamDto - 包含要更新的团队信息的数据传输对象
   * @returns 返回更新后的团队实体
   * @throws ResourceNotFoundException 当团队不存在时抛出异常
   * @throws DatabaseException 当数据库操作失败时抛出异常
   */
  async update(
    id: string,
    updateTeamDto: Partial<CreateTeamDto>,
  ): Promise<Team> {
    try {
      // 先检查团队是否存在
      await this.findOne(id);

      // 更新团队信息
      await this.teamRepository.update(id, updateTeamDto);

      // 返回更新后的团队信息
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`更新团队失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '团队', error);
    }
  }

  /**
   * 删除团队
   *
   * 根据团队ID删除团队记录。
   *
   * @param id - 团队ID
   * @returns 无返回值
   * @throws ResourceNotFoundException 当团队不存在时抛出异常
   * @throws DatabaseException 当数据库操作失败时抛出异常
   */
  async remove(id: string): Promise<void> {
    try {
      // 先检查团队是否存在
      await this.findOne(id);

      // 删除团队
      await this.teamRepository.delete(id);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`删除团队失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '团队', error);
    }
  }
}
