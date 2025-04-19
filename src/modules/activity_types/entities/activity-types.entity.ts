import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('activity_types')
export class ActivityType {
  @ApiProperty({ description: '活动类型ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '活动类型名称', example: '篮球' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '活动类型编码', example: 'basketball' })
  @Column({ length: 50 })
  code: string;

  @ApiProperty({
    description: '图标',
    example: 'basketball-icon.png',
    required: false,
  })
  @Column({ length: 255, nullable: true })
  icon: string;

  @ApiProperty({
    description: '活动类型描述',
    example: '篮球相关活动',
    required: false,
  })
  @Column({ length: 255, nullable: true })
  description: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1 })
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

  // 关联活动
  @OneToMany(() => Activity, activity => activity.type)
  activities: Activity[];
}
