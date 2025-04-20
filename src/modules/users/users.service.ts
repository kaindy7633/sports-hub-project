// src/modules/users/users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto'; // 添加导入 QueryUserDto
import * as crypto from 'crypto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';
import { PAGINATION, STATUS, ROLES } from '../../common/constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // 修改 userRepository 的访问修饰符
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>, // 从 private 改为 public
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 判断用户是否为管理员
   * @param user 用户对象
   * @returns 是否为管理员
   */
  isAdmin(user: User): boolean {
    // 检查用户是否有管理员角色
    if (!user || !user.roles) {
      return false;
    }

    // 方法1: 如果用户角色已经加载并包含角色详情
    if ((user as any).roleDetails) {
      return (user as any).roleDetails.some(
        (role) => role.code === 'admin' || role.code === 'super_admin',
      );
    }

    // 方法2: 通过角色ID判断
    return user.roles.some((userRole) => {
      // 这里需要根据你的角色ID设计来判断
      // 假设角色ID 1是管理员，2是超级管理员
      return [1n, 2n].includes(userRole.role_id);
    });
  }

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
  /**
   * 分页查询用户列表
   * @param params 查询参数，包含分页信息和筛选条件
   * @returns 分页用户列表
   */
  async findAll(queryParams: QueryUserDto = {}) {
    try {
      const {
        pageNum = PAGINATION.DEFAULT_PAGE_NUM,
        pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
        username,
        phone,
        email,
        status,
      } = queryParams;

      const skip = (pageNum - 1) * pageSize;

      // 先使用简单的原生SQL查询验证数据存在，排除敏感字段
      const rawUsers = await this.userRepository.query(
        `SELECT id, user_id, username, nick_name, real_name, avatar, email, phone, 
        emergency_contact, address, gender, birthday, status, created_at, updated_at 
        FROM users WHERE deleted_at IS NULL LIMIT 5`,
      );
      this.logger.log(`原生SQL查询到 ${rawUsers.length} 条记录`);

      // 使用简化的查询方式
      const whereConditions: any = { deleted_at: null };

      if (username) {
        whereConditions.username = Like(`%${username}%`);
      }
      if (phone) {
        whereConditions.phone = Like(`%${phone}%`);
      }
      if (email) {
        whereConditions.email = Like(`%${email}%`);
      }
      if (status !== undefined && status !== null) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.userRepository.count({ where: whereConditions });

      // 查询数据 - 明确指定要查询的字段，排除敏感信息
      const users = await this.userRepository.find({
        select: [
          'id',
          'user_id',
          'username',
          'nick_name',
          'real_name',
          'avatar',
          'email',
          'phone',
          'emergency_contact',
          'address',
          'gender',
          'birthday',
          'status',
          'created_at',
          'updated_at',
        ],
        where: whereConditions,
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      // 如果简化查询能找到数据，再尝试加载关联
      if (users.length > 0) {
        // 手动加载关联数据
        for (const user of users) {
          // 查询用户认证信息，排除敏感字段
          user.auths = await this.userAuthRepository.find({
            select: [
              'id',
              'identity_type',
              'identifier',
              'created_at',
              'updated_at',
            ],
            where: { user_id: user.id },
          });

          // 加载用户角色关系
          const userRoles = await this.userRoleRepository.find({
            where: { user_id: user.id },
          });

          // 修复第二个错误：正确处理角色关系
          if (userRoles.length > 0) {
            const roleIds = userRoles.map((ur) => ur.role_id);
            // 查询角色信息
            const roles = await this.roleRepository.findByIds(roleIds);
            // 保持 user.roles 类型为 UserRole[]
            user.roles = userRoles;
            // 可以添加一个自定义属性存储角色详情
            (user as any).roleDetails = roles;
          } else {
            user.roles = [];
          }
        }
      }

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
      // 校验 userId 参数
      if (
        !userId ||
        userId === '0' ||
        userId === 'undefined' ||
        userId === 'null'
      ) {
        this.logger.error(`查询用户详情失败: 无效的用户ID ${userId}`);
        throw new ResourceNotFoundException('用户', userId || '未提供ID');
      }

      // 直接使用原始SQL查询以避免类型转换问题，明确指定字段
      const [user] = await this.userRepository.query(
        `SELECT id, user_id, username, nick_name, real_name, avatar, email, phone, 
        emergency_contact, address, gender, birthday, status, created_at, updated_at 
        FROM users WHERE user_id = $1 AND deleted_at IS NULL`,
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

  // 添加一个临时方法来验证数据
  async checkUsersExist() {
    const rawUsers = await this.userRepository.query(
      `SELECT id, user_id, username, nick_name, real_name, avatar, email, phone, 
      status, created_at FROM users LIMIT 10`,
    );
    this.logger.log(`原生SQL查询结果: ${JSON.stringify(rawUsers)}`);
    return rawUsers;
  }
}
