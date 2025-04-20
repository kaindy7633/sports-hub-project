import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThan, MoreThan } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { InsufficientPermissionException } from '../../common/exceptions/insufficient-permission.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';
import { PAGINATION } from '../../common/constants';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建活动
   * @param createActivityDto 活动数据
   * @param creator_id 创建者ID
   * @returns
   */
  async create(
    createActivityDto: CreateActivityDto,
    creator_id: string,
  ): Promise<Activity> {
    try {
      // 验证开始时间和结束时间
      const startTime = new Date(createActivityDto.start_time);
      const endTime = new Date(createActivityDto.end_time);

      if (startTime >= endTime) {
        throw new BadRequestException('结束时间必须晚于开始时间');
      }

      // 生成业务活动ID
      const activity_id = this.snowflakeService.generate();

      // 创建活动实体（直接逐个设置属性）
      const activity = new Activity();
      activity.activity_id = activity_id;
      activity.title = createActivityDto.title;
      activity.type_id = BigInt(createActivityDto.type_id);
      activity.venue_id = BigInt(createActivityDto.venue_id);
      activity.creator_id = BigInt(creator_id);
      activity.description = createActivityDto.description || '';
      activity.start_time = startTime;
      activity.end_time = endTime;
      activity.max_participants = createActivityDto.max_participants || 0;
      activity.current_participants = 0;
      activity.fee = createActivityDto.fee || 0;
      activity.status = createActivityDto.status || 0;

      // 保存活动
      return await this.activityRepository.save(activity);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`创建活动失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '活动', error);
    }
  }

  /**
   * 分页查询活动列表
   * @param queryParams 查询参数
   * @returns
   */
  async findAll(queryParams: QueryActivityDto = {}) {
    try {
      const {
        title,
        type_id,
        venue_id,
        creator_id,
        team_id,
        start_time_from,
        start_time_to,
        status,
        pageNum = PAGINATION.DEFAULT_PAGE_NUM,
        pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
      } = queryParams;

      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};

      if (title) {
        whereConditions.title = Like(`%${title}%`);
      }

      if (type_id) {
        whereConditions.type_id = BigInt(type_id);
      }

      if (venue_id) {
        whereConditions.venue_id = BigInt(venue_id);
      }

      if (creator_id) {
        whereConditions.creator_id = BigInt(creator_id);
      }

      if (team_id) {
        whereConditions.team_id = BigInt(team_id);
      }

      // 处理开始时间范围查询
      if (start_time_from && start_time_to) {
        whereConditions.start_time = Between(start_time_from, start_time_to);
      } else if (start_time_from) {
        whereConditions.start_time = MoreThan(start_time_from);
      } else if (start_time_to) {
        whereConditions.start_time = LessThan(start_time_to);
      }

      if (status !== undefined) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.activityRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const activities = await this.activityRepository.find({
        where: whereConditions,
        relations: ['type', 'venue'],
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      return {
        list: activities,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询活动列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '活动列表', error);
    }
  }

  /**
   * 查询我创建的活动
   * @param creator_id 创建者ID
   * @param queryParams 查询参数
   * @returns
   */
  async findMyActivities(
    creator_id: string,
    queryParams: QueryActivityDto = {},
  ) {
    // 设置创建者ID，然后复用findAll方法
    const params = { ...queryParams, creator_id };
    return this.findAll(params);
  }

  /**
   * 根据业务ID查询活动详情
   * @param activityId 业务活动ID
   * @returns
   */
  async findOne(activityId: string): Promise<Activity> {
    try {
      // 直接使用原始SQL查询以避免类型转换问题
      const [activity] = await this.activityRepository.query(
        'SELECT * FROM activities WHERE activity_id = $1 AND deleted_at IS NULL',
        [activityId],
      );

      if (!activity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      // 查询关联信息
      const activityWithRelations = await this.activityRepository.findOne({
        where: { id: activity.id },
        relations: ['type', 'venue', 'comments'],
      });

      // 检查结果是否为null
      if (!activityWithRelations) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      return activityWithRelations;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询活动详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '活动详情', error);
    }
  }

  /**
   * 更新活动
   * @param activityId 业务活动ID
   * @param updateActivityDto 更新数据
   * @param userId 操作用户ID
   * @param isAdmin 是否为管理员
   * @returns
   */
  async update(
    activityId: string,
    updateActivityDto: UpdateActivityDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Activity> {
    try {
      // 查询要更新的活动是否存在
      const activity = await this.findOne(activityId);

      // 检查是否有权限更新（创建者或管理员）
      if (activity.creator_id.toString() !== userId && !isAdmin) {
        throw new InsufficientPermissionException('活动', '更新');
      }

      // 检查活动状态，已结束的活动不允许修改
      if (activity.status === 4) {
        throw new BadRequestException('已结束的活动不允许修改');
      }

      // 验证开始时间和结束时间
      let startTime = activity.start_time;
      let endTime = activity.end_time;

      if (updateActivityDto.start_time) {
        startTime = new Date(updateActivityDto.start_time);
      }

      if (updateActivityDto.end_time) {
        endTime = new Date(updateActivityDto.end_time);
      }

      if (startTime >= endTime) {
        throw new BadRequestException('结束时间必须晚于开始时间');
      }

      // 创建更新对象
      const updateData: any = {};

      // 只复制需要更新的字段
      if (updateActivityDto.title !== undefined) {
        updateData.title = updateActivityDto.title;
      }

      if (updateActivityDto.description !== undefined) {
        updateData.description = updateActivityDto.description;
      }

      if (updateActivityDto.type_id !== undefined) {
        updateData.type_id = BigInt(updateActivityDto.type_id);
      }

      if (updateActivityDto.venue_id !== undefined) {
        updateData.venue_id = BigInt(updateActivityDto.venue_id);
      }

      if (updateActivityDto.team_id !== undefined) {
        updateData.team_id = updateActivityDto.team_id
          ? BigInt(updateActivityDto.team_id)
          : null;
      }

      if (updateActivityDto.start_time !== undefined) {
        updateData.start_time = startTime;
      }

      if (updateActivityDto.end_time !== undefined) {
        updateData.end_time = endTime;
      }

      if (updateActivityDto.max_participants !== undefined) {
        updateData.max_participants = updateActivityDto.max_participants;
      }

      if (updateActivityDto.fee !== undefined) {
        updateData.fee = updateActivityDto.fee;
      }

      if (updateActivityDto.status !== undefined) {
        updateData.status = updateActivityDto.status;
      }

      // 更新活动 - 使用正确的ID转换
      await this.activityRepository.update(
        { id: activity.id }, // 使用对象形式指定条件
        updateData,
      );

      // 返回更新后的活动
      const updatedActivity = await this.activityRepository.findOne({
        where: { id: activity.id },
        relations: ['type', 'venue'],
      });

      // 添加空值检查
      if (!updatedActivity) {
        throw new ResourceNotFoundException('活动', activityId);
      }

      return updatedActivity;
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`更新活动失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '活动', error);
    }
  }

  /**
   * 删除活动
   * @param activityId 业务活动ID
   * @param userId 操作用户ID
   * @param isAdmin 是否为管理员
   */
  async remove(
    activityId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<void> {
    try {
      // 查询要删除的活动是否存在
      const activity = await this.findOne(activityId);

      // 检查是否有权限删除（创建者或管理员）
      if (activity.creator_id.toString() !== userId && !isAdmin) {
        throw new InsufficientPermissionException('活动', '删除');
      }

      // 如果已经有人参加，进行中或已结束的活动不允许删除
      if (activity.current_participants > 0 && activity.status > 1) {
        throw new BadRequestException('已有人参加的活动不允许删除');
      }

      // 执行软删除 - 使用对象形式指定条件，避免bigint类型问题
      await this.activityRepository.softDelete({ id: activity.id });
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`删除活动失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '活动', error);
    }
  }

  /**
   * 参加活动
   * @param activityId 业务活动ID
   * @param userId 用户ID
   * @returns
   */
  async joinActivity(activityId: string, userId: string) {
    try {
      // 查询活动
      const activity = await this.findOne(activityId);

      // 检查活动状态
      if (activity.status === 0) {
        throw new BadRequestException('草稿状态的活动不能参加');
      }

      if (activity.status === 4) {
        throw new BadRequestException('已结束的活动不能参加');
      }

      // 检查人数上限
      if (
        activity.max_participants > 0 &&
        activity.current_participants >= activity.max_participants
      ) {
        throw new BadRequestException('活动参与人数已达上限');
      }

      // TODO: 这里应该检查用户是否已经参加过该活动，需要增加活动参与者关联表

      // 增加参与人数
      activity.current_participants += 1;
      await this.activityRepository.save(activity);

      return { message: '成功参加会议' };
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`参加会议失败: ${error.message}`, error.stack);
      throw new DatabaseException('参加', '活动', error);
    }
  }

  /**
   * 退出活动
   * @param activityId 业务活动ID
   * @param userId 用户ID
   * @returns
   */
  async leaveActivity(activityId: string, userId: string) {
    try {
      // 查询活动
      const activity = await this.findOne(activityId);

      // 检查活动状态
      if (activity.status === 4) {
        throw new BadRequestException('已结束的活动不能退出');
      }

      // TODO: 这里应该检查用户是否参加过该活动，需要增加活动参与者关联表

      // 减少参与人数
      if (activity.current_participants > 0) {
        activity.current_participants -= 1;
        await this.activityRepository.save(activity);
      }

      return { message: '成功退出活动' };
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`退出活动失败: ${error.message}`, error.stack);
      throw new DatabaseException('退出', '活动', error);
    }
  }
}
