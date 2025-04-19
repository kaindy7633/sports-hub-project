import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

@Entity('managers')
export class Manager {
  @ApiProperty({ description: '管理员ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '管理员ID', example: '0' })
  @Column({ type: 'bigint', transformer: new BigIntTransformer(), default: 0 })
  manager_id: string;

  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({ description: '管理员密码', example: 'password123' })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({ description: '密码加密盐值', example: 'abc123' })
  @Column({ type: 'varchar', length: 32 })
  salt: string;

  @ApiProperty({ description: '父级管理员ID', example: '0' })
  @Column({ type: 'bigint', default: 0 })
  parent_id: number;

  @ApiProperty({ description: '管理员昵称', example: 'admin', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  nick_name: string;

  @ApiProperty({
    description: '管理员真实姓名',
    example: '张三',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  real_name: string;

  @ApiProperty({
    description: '头像',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  email: string;

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
}
