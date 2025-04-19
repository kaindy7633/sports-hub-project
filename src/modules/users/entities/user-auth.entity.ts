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
import { User } from './user.entity';

@Entity('user_auths')
export class UserAuth {
  @ApiProperty({ description: '用户认证ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '用户ID', example: '1' })
  @Column('bigint')
  user_id: bigint;

  @ApiProperty({
    description: '身份类型',
    example: 'email',
    enum: ['username', 'email', 'phone', 'wechat'],
  })
  @Column({ length: 20 })
  identity_type: string;

  @ApiProperty({ description: '身份标识符', example: 'user@example.com' })
  @Column({ length: 100 })
  identifier: string;

  @ApiProperty({ description: '凭证', example: 'password123' })
  @Column({ length: 255 })
  credential: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ApiProperty({ description: '关联用户', type: () => User })
  @ManyToOne(() => User, (user) => user.auths)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
