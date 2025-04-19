import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { QueryMessageDto } from './dto/query-message.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { InsufficientPermissionException } from '../../common/exceptions/insufficient-permission.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 发送消息
   * @param createMessageDto
   * @param sender_id
   * @returns
   */
  async create(
    createMessageDto: CreateMessageDto,
    sender_id: string,
  ): Promise<Message> {
    try {
      // 生成业务消息ID
      const message_id = this.snowflakeService.generate();

      // 创建消息实体
      const message = this.messageRepository.create({
        ...createMessageDto,
        message_id,
        sender_id: BigInt(sender_id),
        receiver_id: BigInt(createMessageDto.receiver_id),
        read_status: 0, // 初始为未读状态
      });

      return await this.messageRepository.save(message);
    } catch (error) {
      this.logger.error(`发送消息失败: ${error.message}`, error.stack);
      throw new DatabaseException('发送', '消息', error);
    }
  }

  /**
   * 分页查询消息列表
   * @param queryParams
   * @returns
   */
  async findAll(queryParams: QueryMessageDto = {}) {
    try {
      const {
        sender_id,
        receiver_id,
        type,
        read_status,
        pageNum = 1,
        pageSize = 10,
      } = queryParams;

      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};

      if (sender_id) {
        whereConditions.sender_id = BigInt(sender_id);
      }

      if (receiver_id) {
        whereConditions.receiver_id = BigInt(receiver_id);
      }

      if (type !== undefined) {
        whereConditions.type = type;
      }

      if (read_status !== undefined) {
        whereConditions.read_status = read_status;
      }

      // 查询总数
      const total = await this.messageRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const messages = await this.messageRepository.find({
        where: whereConditions,
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      return {
        list: messages,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询消息列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '消息列表', error);
    }
  }

  /**
   * 查询用户收件箱
   * @param userId
   * @param queryParams
   * @returns
   */
  async findInbox(userId: string, queryParams: QueryMessageDto = {}) {
    // 设置接收者ID，然后复用findAll方法
    const params = { ...queryParams, receiver_id: userId };
    return this.findAll(params);
  }

  /**
   * 查询用户发件箱
   * @param userId
   * @param queryParams
   * @returns
   */
  async findOutbox(userId: string, queryParams: QueryMessageDto = {}) {
    // 设置发送者ID，然后复用findAll方法
    const params = { ...queryParams, sender_id: userId };
    return this.findAll(params);
  }

  /**
   * 获取用户未读消息数量
   * @param userId
   * @returns
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    try {
      const count = await this.messageRepository.count({
        where: {
          receiver_id: BigInt(userId),
          read_status: 0,
        },
      });

      return { count };
    } catch (error) {
      this.logger.error(`获取未读消息数量失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '未读消息数量', error);
    }
  }

  /**
   * 根据业务ID查询消息详情
   * @param messageId
   * @param userId
   * @returns
   */
  async findOne(messageId: string, userId: string): Promise<Message> {
    try {
      // 直接使用原始SQL查询以避免类型转换问题
      const [message] = await this.messageRepository.query(
        'SELECT * FROM messages WHERE message_id = $1 AND deleted_at IS NULL',
        [messageId],
      );

      if (!message) {
        throw new ResourceNotFoundException('消息', messageId);
      }

      // 验证用户是否有权限查看该消息（发送者或接收者）
      const userIdBigInt = BigInt(userId);
      if (
        message.sender_id !== userIdBigInt.toString() &&
        message.receiver_id !== userIdBigInt.toString()
      ) {
        throw new InsufficientPermissionException('消息', '查看');
      }

      // 如果是接收者查看，自动标记为已读
      if (
        message.receiver_id === userIdBigInt.toString() &&
        message.read_status === 0
      ) {
        await this.markAsRead(messageId, userId);
        message.read_status = 1;
      }

      return message;
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`查询消息详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '消息详情', error);
    }
  }

  /**
   * 标记消息为已读
   * @param messageId
   * @param userId
   * @returns
   */
  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      // 查询消息是否存在
      const message = await this.messageRepository.findOne({
        where: { message_id: messageId },
      });

      if (!message) {
        throw new ResourceNotFoundException('消息', messageId);
      }

      // 验证用户是否是接收者
      if (message.receiver_id.toString() !== userId) {
        throw new InsufficientPermissionException('消息', '标记已读');
      }

      // 更新已读状态
      await this.messageRepository.update(
        { id: message.id },
        { read_status: 1 },
      );

      return { message: '消息已标记为已读' };
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`标记消息已读失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '消息状态', error);
    }
  }

  /**
   * 删除消息
   * @param messageId
   * @param userId
   * @param isAdmin
   * @returns
   */
  async remove(
    messageId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ message: string }> {
    try {
      // 查询消息是否存在
      const message = await this.messageRepository.findOne({
        where: { message_id: messageId },
      });

      if (!message) {
        throw new ResourceNotFoundException('消息', messageId);
      }

      // 验证用户是否有权限删除消息（发送者、接收者或管理员）
      if (
        message.sender_id.toString() !== userId &&
        message.receiver_id.toString() !== userId &&
        !isAdmin
      ) {
        throw new InsufficientPermissionException('消息', '删除');
      }

      // 执行软删除 - 使用对象形式指定条件
      await this.messageRepository.softDelete({ id: message.id });

      return { message: '消息删除成功' };
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`删除消息失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '消息', error);
    }
  }
}
