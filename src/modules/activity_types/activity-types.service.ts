import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { ActivityType } from './activity-types-entity';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { QueryActivityTypeDto } from './dto/query-activity-type.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class ActivityTypesService {
  private readonly logger = new Logger(ActivityTypesService.name);

  constructor(
    @InjectRepository(ActivityType)
    private readonly activityTypeRepository: Repository<ActivityType>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建活动类型
   * @param createActivityTypeDto
   * @returns
   */
  async create(
    createActivityTypeDto: CreateActivityTypeDto,
  ): Promise<ActivityType> {
    try {
      // 检查编码是否已存在
      const existingType = await this.activityTypeRepository.findOne({
        where: { code: createActivityTypeDto.code },
      });

      if (existingType) {
        throw new BadRequestException(
          `活动类型编码 ${createActivityTypeDto.code} 已存在`,
        );
      }

      // 创建活动类型
      const activityType = this.activityTypeRepository.create(
        createActivityTypeDto,
      );
      return await this.activityTypeRepository.save(activityType);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`创建活动类型失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '活动类型', error);
    }
  }

  /**
   * 分页查询活动类型列表
   * @param queryParams
   * @returns
   */
  async findAll(queryParams: QueryActivityTypeDto = {}) {
    try {
      const { name, code, status, pageNum = 1, pageSize = 10 } = queryParams;
      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};
      if (name) {
        whereConditions.name = name;
      }
      if (code) {
        whereConditions.code = code;
      }
      if (status !== undefined) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.activityTypeRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const types = await this.activityTypeRepository.find({
        where: whereConditions,
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      return {
        list: types,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询活动类型列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '活动类型列表', error);
    }
  }

  /**
   * 获取所有活动类型（不分页）
   * @returns
   */
  async findAllList(): Promise<ActivityType[]> {
    try {
      return await this.activityTypeRepository.find({
        where: { status: 1 }, // 只返回启用的活动类型
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`获取所有活动类型失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '所有活动类型', error);
    }
  }

  /**
   * 根据ID查询活动类型详情
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<ActivityType> {
    try {
      const activityType = await this.activityTypeRepository.findOne({
        where: { id: BigInt(id) },
      });

      if (!activityType) {
        throw new ResourceNotFoundException('活动类型', id);
      }

      return activityType;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询活动类型详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '活动类型详情', error);
    }
  }

  /**
   * 根据编码查询活动类型
   * @param code
   * @returns
   */
  async findByCode(code: string): Promise<ActivityType | null> {
    try {
      return await this.activityTypeRepository.findOne({
        where: { code },
      });
    } catch (error) {
      this.logger.error(
        `根据编码查询活动类型失败: ${error.message}`,
        error.stack,
      );
      throw new DatabaseException('查询', '活动类型', error);
    }
  }

  /**
   * 更新活动类型
   * @param id
   * @param updateActivityTypeDto
   * @returns
   */
  async update(
    id: string,
    updateActivityTypeDto: UpdateActivityTypeDto,
  ): Promise<ActivityType> {
    try {
      // 查询要更新的活动类型是否存在
      const activityType = await this.findOne(id);

      // 如果更新编码，检查编码是否与其他活动类型冲突
      if (
        updateActivityTypeDto.code &&
        updateActivityTypeDto.code !== activityType.code
      ) {
        const existingType = await this.activityTypeRepository.findOne({
          where: { code: updateActivityTypeDto.code, id: Not(activityType.id) },
        });

        if (existingType) {
          throw new BadRequestException(
            `活动类型编码 ${updateActivityTypeDto.code} 已存在`,
          );
        }
      }

      // 更新活动类型
      Object.assign(activityType, updateActivityTypeDto);
      return await this.activityTypeRepository.save(activityType);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`更新活动类型失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '活动类型', error);
    }
  }

  /**
   * 删除活动类型
   * @param id
   */
  async remove(id: string): Promise<void> {
    try {
      // 查询要删除的活动类型是否存在
      const activityType = await this.findOne(id);

      // 检查活动类型是否被活动引用
      const isUsed =
        activityType.activities && activityType.activities.length > 0;
      if (isUsed) {
        throw new BadRequestException(
          `活动类型 ${activityType.name} 已被活动引用，无法删除`,
        );
      }

      // 执行软删除
      await this.activityTypeRepository.softDelete({ id: activityType.id });
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`删除活动类型失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '活动类型', error);
    }
  }
}
