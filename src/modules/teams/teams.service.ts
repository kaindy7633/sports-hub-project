import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { PAGINATION, STATUS } from '../../common/constants';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    try {
      const team = this.teamRepository.create(createTeamDto);
      return await this.teamRepository.save(team);
    } catch (error) {
      this.logger.error(`创建团队失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '团队', error);
    }
  }

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

  async findOne(id: string): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({ where: { id } });
      if (!team) {
        throw new ResourceNotFoundException('团队', id);
      }
      return team;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询团队详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '团队详情', error);
    }
  }

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
