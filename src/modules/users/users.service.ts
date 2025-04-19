// src/modules/users/users.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // 生成盐值
      const salt = crypto.randomBytes(16).toString('hex');
      // 使用盐值加密密码
      const hashedPassword = crypto
        .pbkdf2Sync(createUserDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');

      // 生成业务用户ID（使用雪花算法）
      const user_id = this.snowflakeService.generate();

      // 创建用户实体
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        salt,
        user_id,
      });

      // 保存用户
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`, error.stack);
      throw new DatabaseException('创建', '用户', error);
    }
  }

  /**
   * 分页查询用户列表
   * @param params 查询参数，包含分页信息和筛选条件
   * @returns 分页用户列表
   */
  async findAll(params?: {
    pageNum: number;
    pageSize: number;
    username?: string;
    phone?: string;
    email?: string;
  }) {
    try {
      if (!params) {
        return await this.userRepository.find({
          relations: ['auths', 'roles'],
        });
      }

      const { pageNum, pageSize, username, phone, email } = params;
      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};
      if (username) whereConditions.username = username;
      if (phone) whereConditions.phone = phone;
      if (email) whereConditions.email = email;

      // 查询总数
      const total = await this.userRepository.count({ where: whereConditions });

      // 查询数据
      const users = await this.userRepository.find({
        where: whereConditions,
        relations: ['auths', 'roles'],
        skip,
        take: pageSize,
      });

      return {
        list: users,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询用户列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '用户列表', error);
    }
  }

  /**
   * 根据内部ID查询用户（仅内部使用）
   * @param id 内部用户ID
   * @returns 用户实体
   */
  private async findById(id: bigint): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['auths', 'roles'],
    });

    if (!user) {
      throw new ResourceNotFoundException('用户', id.toString());
    }

    return user;
  }

  /**
   * 根据业务ID查询用户
   * @param userId 业务用户ID
   * @returns 用户实体
   */
  async findOne(userId: string): Promise<User> {
    try {
      // 直接使用原始SQL查询以避免类型转换问题
      const [user] = await this.userRepository.query(
        'SELECT * FROM users WHERE user_id = $1 AND deleted_at IS NULL',
        [userId],
      );

      if (!user) {
        throw new ResourceNotFoundException('用户', userId);
      }

      return user;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询用户详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '用户详情', error);
    }
  }

  /**
   * 更新用户信息
   * @param userId 业务用户ID
   * @param updateUserDto 更新内容
   * @returns 更新后的用户
   */
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(userId);

      // 如果更新包含密码，需要重新加密
      if (updateUserDto.password) {
        const hashedPassword = crypto
          .pbkdf2Sync(updateUserDto.password, user.salt, 1000, 64, 'sha512')
          .toString('hex');
        updateUserDto.password = hashedPassword;
      }

      // 更新用户信息
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`更新用户失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '用户', error);
    }
  }

  /**
   * 删除用户
   * @param userId 业务用户ID
   */
  async remove(userId: string): Promise<void> {
    try {
      const user = await this.findOne(userId);
      await this.userRepository.softDelete({ id: user.id });
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`删除用户失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '用户', error);
    }
  }

  /**
   * 添加用户认证方式
   * @param authData
   * @returns
   */
  async addUserAuth(authData: {
    userId: string;
    identityType: string;
    identifier: string;
    credential: string;
  }) {
    try {
      const { userId, identityType, identifier, credential } = authData;

      // 查找用户是否存在
      const user = await this.findOne(userId);

      const userAuth = this.userAuthRepository.create({
        user_id: user.id, // 使用内部ID关联
        identity_type: identityType,
        identifier,
        credential,
      });
      return await this.userAuthRepository.save(userAuth);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`添加用户认证失败: ${error.message}`, error.stack);
      throw new DatabaseException('添加', '用户认证', error);
    }
  }

  /**
   * 创建用户认证信息
   * @param authData
   * @returns
   */
  async createUserAuth(authData: {
    user_id: bigint;
    identity_type: string;
    identifier: string;
    credential: string;
  }) {
    const userAuth = this.userAuthRepository.create(authData);
    return await this.userAuthRepository.save(userAuth);
  }

  /**
   * 根据用户名查找用户
   * @param username
   * @returns
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 根据手机号查找用户
   * @param phone
   * @returns
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 根据邮箱查找用户
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['auths', 'roles'],
    });
  }

  /**
   * 获取所有用户列表（不分页）
   * @param params 筛选条件
   * @returns 用户列表
   */
  async findAllList(params?: {
    username?: string;
    phone?: string;
    email?: string;
  }): Promise<User[]> {
    try {
      // 构建查询条件
      const whereConditions: any = {};
      if (params) {
        if (params.username) whereConditions.username = params.username;
        if (params.phone) whereConditions.phone = params.phone;
        if (params.email) whereConditions.email = params.email;
      }

      return await this.userRepository.find({
        where: whereConditions,
        relations: ['auths', 'roles'],
      });
    } catch (error) {
      this.logger.error(`查询用户列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '用户列表', error);
    }
  }

  /**
   * 为用户分配角色
   * @param userId 业务用户ID
   * @param roleId 业务角色ID
   * @returns
   */
  async assignRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      // 查找用户和角色
      const user = await this.findOne(userId);
      const role = await this.roleRepository.findOne({
        where: { role_id: roleId },
      });

      if (!role) {
        throw new ResourceNotFoundException('角色', roleId.toString());
      }

      const userRole = this.userRoleRepository.create({
        user_id: user.id, // 使用内部ID
        role_id: role.id, // 使用内部ID
      });
      return await this.userRoleRepository.save(userRole);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`分配角色失败: ${error.message}`, error.stack);
      throw new DatabaseException('分配', '用户角色', error);
    }
  }

  /**
   * 验证用户密码
   * @param plainPassword
   * @param hashedPassword
   * @param salt
   * @returns
   */
  verifyPassword(
    plainPassword: string,
    hashedPassword: string,
    salt: string,
  ): boolean {
    const hash = crypto
      .pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === hashedPassword;
  }
}
