import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { DatabaseException } from '../../common/exceptions/database.exception';
import { InsufficientPermissionException } from '../../common/exceptions/insufficient-permission.exception';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  /**
   * 发表评论
   * @param createCommentDto
   * @param userId
   * @returns
   */
  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    try {
      // 生成业务评论ID
      const comment_id = this.snowflakeService.generate();

      // 创建评论实体
      const comment = new Comment();
      comment.comment_id = comment_id;
      comment.activity_id = BigInt(createCommentDto.activity_id);
      comment.user_id = BigInt(userId);

      // 处理parent_id - 修复不能将null分配给bigint的问题
      if (createCommentDto.parent_id) {
        comment.parent_id = BigInt(createCommentDto.parent_id);
      } else {
        // 使用类型断言解决null不能赋值给bigint的问题
        comment.parent_id = null as unknown as bigint;
        // 或者在实体类中将parent_id定义为可为null: bigint | null
      }

      comment.content = createCommentDto.content;
      comment.likes = 0;
      comment.status = 1; // 默认显示

      return await this.commentRepository.save(comment);
    } catch (error) {
      this.logger.error(`发表评论失败: ${error.message}`, error.stack);
      throw new DatabaseException('发表', '评论', error);
    }
  }

  /**
   * 分页查询评论列表
   * @param queryParams
   * @returns
   */
  async findAll(queryParams: QueryCommentDto = {}) {
    try {
      const {
        activity_id,
        user_id,
        parent_id,
        status,
        pageNum = 1,
        pageSize = 10,
      } = queryParams;

      const skip = (pageNum - 1) * pageSize;

      // 构建查询条件
      const whereConditions: any = {};

      if (activity_id) {
        whereConditions.activity_id = BigInt(activity_id);
      }

      if (user_id) {
        whereConditions.user_id = BigInt(user_id);
      }

      if (parent_id) {
        whereConditions.parent_id = BigInt(parent_id);
      } else {
        // 默认查询顶级评论（没有父评论的）
        whereConditions.parent_id = null;
      }

      if (status !== undefined) {
        whereConditions.status = status;
      }

      // 查询总数
      const total = await this.commentRepository.count({
        where: whereConditions,
      });

      // 查询数据
      const comments = await this.commentRepository.find({
        where: whereConditions,
        relations: ['activity'],
        skip,
        take: pageSize,
        order: {
          created_at: 'DESC',
        },
      });

      // 查询每个顶级评论的回复数量
      if (!parent_id) {
        for (const comment of comments) {
          const repliesCount = await this.commentRepository.count({
            where: { parent_id: comment.id },
          });
          (comment as any).repliesCount = repliesCount;
        }
      }

      return {
        list: comments,
        total,
        pageNum,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`查询评论列表失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '评论列表', error);
    }
  }

  /**
   * 根据业务ID查询评论详情
   * @param commentId
   * @returns
   */
  async findOne(commentId: string): Promise<Comment> {
    try {
      // 直接使用原始SQL查询以避免类型转换问题
      const [comment] = await this.commentRepository.query(
        'SELECT * FROM comments WHERE comment_id = $1 AND deleted_at IS NULL',
        [commentId],
      );

      if (!comment) {
        throw new ResourceNotFoundException('评论', commentId);
      }

      // 查询回复列表
      if (!comment.parent_id) {
        const replies = await this.commentRepository.find({
          where: { parent_id: comment.id },
          order: { created_at: 'ASC' },
        });
        (comment as any).replies = replies;
      }

      return comment;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`查询评论详情失败: ${error.message}`, error.stack);
      throw new DatabaseException('查询', '评论详情', error);
    }
  }

  /**
   * 更新评论
   * @param commentId
   * @param updateCommentDto
   * @param userId
   * @param isAdmin
   * @returns
   */
  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<Comment> {
    try {
      // 查询要更新的评论是否存在
      const comment = await this.findOne(commentId);

      // 检查是否有权限更新（评论者或管理员）
      if (comment.user_id.toString() !== userId && !isAdmin) {
        throw new InsufficientPermissionException('评论', '更新');
      }

      // 创建更新对象
      const updateData: any = {};

      // 除了管理员，普通用户只能更新自己的评论内容
      if (!isAdmin) {
        // 普通用户只能更新内容
        const { content } = updateCommentDto;
        if (content !== undefined) {
          updateData.content = content;
        }
      } else {
        // 管理员可以更新状态等信息
        if (updateCommentDto.content !== undefined) {
          updateData.content = updateCommentDto.content;
        }
        if (updateCommentDto.status !== undefined) {
          updateData.status = updateCommentDto.status;
        }
      }

      // 更新评论
      await this.commentRepository.update(
        { id: comment.id }, // 使用对象形式
        updateData,
      );

      // 返回更新后的评论
      const updatedComment = await this.commentRepository.findOne({
        where: { id: comment.id },
        relations: ['activity'],
      });

      if (!updatedComment) {
        throw new ResourceNotFoundException('评论', commentId);
      }

      return updatedComment;
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`更新评论失败: ${error.message}`, error.stack);
      throw new DatabaseException('更新', '评论', error);
    }
  }

  /**
   * 删除评论
   * @param commentId
   * @param userId
   * @param isAdmin
   * @returns
   */
  async remove(
    commentId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ message: string }> {
    try {
      // 查询要删除的评论是否存在
      const comment = await this.findOne(commentId);

      // 检查是否有权限删除（评论者或管理员）
      if (comment.user_id.toString() !== userId && !isAdmin) {
        throw new InsufficientPermissionException('评论', '删除');
      }

      // 如果是顶级评论，同时删除其下的所有回复
      if (!comment.parent_id) {
        await this.commentRepository.softDelete({ parent_id: comment.id });
      }

      // 执行软删除
      await this.commentRepository.softDelete({ id: comment.id });

      return { message: '评论删除成功' };
    } catch (error) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InsufficientPermissionException
      ) {
        throw error;
      }
      this.logger.error(`删除评论失败: ${error.message}`, error.stack);
      throw new DatabaseException('删除', '评论', error);
    }
  }

  /**
   * 点赞评论
   * @param commentId
   * @returns
   */
  async likeComment(
    commentId: string,
  ): Promise<{ message: string; likes: number }> {
    try {
      // 查询评论是否存在
      const comment = await this.findOne(commentId);

      // 增加点赞数
      comment.likes += 1;

      // 更新点赞数
      await this.commentRepository.update(
        { id: comment.id },
        { likes: comment.likes },
      );

      return {
        message: '点赞成功',
        likes: comment.likes,
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(`点赞评论失败: ${error.message}`, error.stack);
      throw new DatabaseException('点赞', '评论', error);
    }
  }
}
