import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';
import { ActivityType } from '../../activity_types/entities/activity-types.entity';
import { Venue } from '../../venues/entities/venues.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('activities')
export class Activity {
  @ApiProperty({ description: '活动ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务活动ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  activity_id: string;

  @ApiProperty({ description: '活动标题', example: '周末篮球赛' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '活动类型ID', example: '1' })
  @Column({ type: 'bigint' })
  type_id: bigint;

  @ApiProperty({ description: '场地ID', example: '1' })
  @Column({ type: 'bigint' })
  venue_id: bigint;

  @ApiProperty({ description: '创建者ID', example: '1' })
  @Column({ type: 'bigint' })
  creator_id: bigint;

  @ApiProperty({ description: '团队ID', example: '1', required: false })
  @Column({ type: 'bigint', nullable: true })
  team_id: bigint;

  @ApiProperty({
    description: '活动描述',
    example: '这是一场精彩的篮球比赛，欢迎参加！',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '开始时间', example: '2023-08-01T14:00:00' })
  @Column()
  start_time: Date;

  @ApiProperty({ description: '结束时间', example: '2023-08-01T16:00:00' })
  @Column()
  end_time: Date;

  @ApiProperty({
    description: '最大参与人数，0表示不限制',
    example: 20,
  })
  @Column({ default: 0 })
  max_participants: number;

  @ApiProperty({ description: '当前参与人数', example: 10 })
  @Column({ default: 0 })
  current_participants: number;

  @ApiProperty({ description: '参与费用', example: 50.0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fee: number;

  @ApiProperty({
    description: '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束',
    example: 1,
  })
  @Column({ type: 'smallint', default: 0 })
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

  // 活动类型关联
  @ManyToOne(() => ActivityType, (activityType) => activityType.activities)
  @JoinColumn({ name: 'type_id' })
  type: ActivityType;

  // 场地关联
  @ManyToOne(() => Venue, (venue) => venue.activities)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  // 评论关联
  @OneToMany(() => Comment, (comment) => comment.activity)
  comments: Comment[];
}
