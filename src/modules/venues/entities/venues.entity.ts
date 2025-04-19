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

@Entity('venues')
export class Venue {
  @ApiProperty({ description: '场地ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务场地ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
    unique: true,
  })
  venue_id: string;

  @ApiProperty({ description: '场地名称', example: '奥林匹克体育馆' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '场地地址', example: '北京市朝阳区奥林匹克公园' })
  @Column({ length: 255 })
  address: string;

  @ApiProperty({ description: '联系电话', example: '010-12345678' })
  @Column({ length: 20 })
  contact_phone: string;

  @ApiProperty({
    description: '营业时间',
    example: '周一至周日 09:00-22:00',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  business_hours: string;

  @ApiProperty({
    description: '场地设施描述',
    example: '标准篮球场4个，羽毛球场6个，游泳池1个',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  facilities: string;

  @ApiProperty({
    description: '场地图片，JSON数组',
    example: '["image1.jpg", "image2.jpg"]',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  images: string;

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
  @OneToMany(() => Activity, activity => activity.venue)
  activities: Activity[];
}
