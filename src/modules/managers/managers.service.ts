// src/modules/managers/managers.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';

@Injectable()
export class ManagersService {
  private readonly logger = new Logger(ManagersService.name);

  constructor(
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建管理员
   * @param createManagerDto 创建管理员DTO
   * @returns 创建的管理员信息
   */
  async create(createManagerDto: CreateManagerDto): Promise<Manager> {
    try {
      // 检查账号是否已存在
      const existingManager = await this.managerRepository.findOne({
        where: { username: createManagerDto.username },
      });

      if (existingManager) {
        throw new ConflictException(`账号 ${createManagerDto.username} 已存在`);
      }

      // 生成雪花ID
      const manager_id = this.snowflakeService.generate();
      // 生成盐值
      const salt = crypto.randomBytes(16).toString('hex');
      // 使用盐值加密密码
      const hashedPassword = crypto
        .pbkdf2Sync(createManagerDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');

      // 创建管理员实体
      const manager = this.managerRepository.create({
        ...createManagerDto,
        manager_id,
        password: hashedPassword,
        salt,
      });

      // 保存管理员
      return await this.managerRepository.save(manager);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`创建管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '管理员', error);
    }
  }

  /**
   * 查询所有管理员
   * @returns 管理员列表
   */
  async findAll(): Promise<Manager[]> {
    // 使用select选项排除敏感字段
    return await this.managerRepository.find({
      select: {
        id: true,
        manager_id: true,
        username: true,
        parent_id: true,
        nick_name: true,
        real_name: true,
        avatar: true,
        phone: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 根据内部ID查询管理员 (仅内部使用)
   * @param id 内部管理员ID
   * @returns 管理员信息
   */
  private async findById(id: bigint): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { id },
    });

    if (!manager) {
      throw new ResourceNotFoundException('管理员', id.toString());
    }

    return manager;
  }

  /**
   * 根据业务ID查询管理员 (对外API使用)
   * @param managerId 业务管理员ID
   * @returns 管理员信息
   */
  async findOne(managerId: string): Promise<Manager> {
    try {
      this.logger.debug(`Searching for manager with business ID: ${managerId}`);

      // 直接使用原始SQL查询以避免类型转换问题，明确指定需要的字段，排除敏感信息
      const [manager] = await this.managerRepository.query(
        'SELECT id, manager_id, username, parent_id, nick_name, real_name, avatar, phone, email, status, created_at, updated_at, deleted_at FROM managers WHERE manager_id = $1 AND deleted_at IS NULL',
        [managerId],
      );

      if (!manager) {
        throw new ResourceNotFoundException('管理员', managerId);
      }

      // 将原始查询结果转换为实体对象
      // 将原始查询结果转换为Manager实体对象并返回
      return Object.assign(new Manager(), manager);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询管理员详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '管理员详情', error);
    }
  }

  /**
   * 根据账号查询管理员
   * @param username 管理员账号
   * @returns 管理员信息
   */
  async findByUsername(username: string): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { username: username },
    });

    if (!manager) {
      throw new NotFoundException(`账号为${username}的管理员不存在`);
    }

    return manager;
  }

  /**
   * 更新管理员信息
   * @param managerId 业务管理员ID
   * @param updateManagerDto 更新管理员DTO
   * @returns 更新后的管理员信息
   */
  async update(
    managerId: string,
    updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    try {
      // 查询要更新的管理员是否存在
      const manager = await this.findOne(managerId);

      // 禁止修改管理员账号
      if (
        updateManagerDto.username &&
        updateManagerDto.username !== manager.username
      ) {
        throw new ConflictException('管理员账号不允许被修改');
      }

      // 移除username字段，确保不会被更新
      if (updateManagerDto.username) {
        delete updateManagerDto.username;
      }

      // 如果更新密码，需要重新加密
      if (updateManagerDto.password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto
          .pbkdf2Sync(updateManagerDto.password, salt, 1000, 64, 'sha512')
          .toString('hex');

        updateManagerDto.password = hashedPassword;
        manager.salt = salt;
      }

      // 更新管理员信息
      Object.assign(manager, updateManagerDto);

      // 保存更新
      return await this.managerRepository.save(manager);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`更新管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '管理员', error);
    }
  }

  /**
   * 删除管理员
   * @param managerId 业务管理员ID
   */
  async remove(managerId: string): Promise<void> {
    try {
      // 查询要删除的管理员是否存在
      const manager = await this.findOne(managerId);

      // 执行软删除
      await this.managerRepository.softDelete({ id: manager.id });
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }

      this.logger.error(`删除管理员失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '管理员', error);
    }
  }

  /**
   * 生成雪花ID
   * @returns 雪花ID
   */
  generateSnowflakeId(): string {
    return this.snowflakeService.generate();
  }
}
