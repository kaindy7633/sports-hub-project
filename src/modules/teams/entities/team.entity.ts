import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('teams')
export class Team {
  @ApiProperty({
    description: '团队ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '团队名称', example: '篮球俱乐部' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: '团队logo图片URL',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @Column({ nullable: true })
  logo: string;

  @ApiProperty({
    description: '团队描述',
    example: '这是一个篮球爱好者的团队',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '团队成员数量', example: 10 })
  @Column({ default: 0 })
  memberCount: number;

  @ApiProperty({ description: '团队活动数量', example: 5 })
  @Column({ default: 0 })
  activityCount: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
