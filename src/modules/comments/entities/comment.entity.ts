import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('comments')
export class Comment {
  @ApiProperty({ description: '评论ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务评论ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  comment_id: string;

  @ApiProperty({ description: '活动ID', example: '1' })
  @Column({ type: 'bigint' })
  activity_id: bigint;

  @ApiProperty({ description: '用户ID', example: '1' })
  @Column({ type: 'bigint' })
  user_id: bigint;

  @ApiProperty({ description: '父评论ID', example: '0', required: false })
  @Column({ type: 'bigint', nullable: true })
  parent_id: bigint;

  @ApiProperty({ description: '评论内容', example: '这是一个很棒的活动！' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '点赞数', example: 10 })
  @Column({ default: 0 })
  likes: number;

  @ApiProperty({ description: '状态：0-隐藏，1-显示', example: 1 })
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  // 活动关联
  @ManyToOne(() => Activity, activity => activity.comments)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
}
