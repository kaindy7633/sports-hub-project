// src/modules/users/entities/user.entity.ts
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
import { UserAuth } from './user-auth.entity';
import { UserRole } from './user-role.entity';
import { UserTeam } from '../../teams/entities/user-team.entity';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '用户统一ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  user_id: string;

  @ApiProperty({ description: '用户名', example: 'johndoe' })
  @Column({ length: 50 })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @Column()
  password: string;

  @ApiProperty({ description: '密码加密盐值', example: 'abc123' })
  @Column({ length: 32 })
  salt: string;

  @ApiProperty({ description: '用户昵称', example: 'John', required: false })
  @Column({ length: 50, nullable: true })
  nick_name: string;

  @ApiProperty({
    description: '用户真实姓名',
    example: 'John Doe',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  real_name: string;

  @ApiProperty({
    description: '身份证号',
    example: '110101199001011234',
    required: false,
  })
  @Column({ length: 18, nullable: true })
  id_card: string;

  @ApiProperty({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ length: 255, nullable: true })
  avatar: string;

  @ApiProperty({
    description: '电子邮箱',
    example: 'john@example.com',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiProperty({
    description: '电话号码',
    example: '13800138000',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({
    description: '紧急联系人电话',
    example: '13900139000',
    required: false,
  })
  @Column({ length: 20, nullable: true })
  emergency_contact: string;

  @ApiProperty({
    description: '地址',
    example: '北京市海淀区',
    required: false,
  })
  @Column({ length: 255, nullable: true })
  address: string;

  @ApiProperty({
    description: '性别(0:未知,1:男,2:女)',
    example: 1,
    required: false,
  })
  @Column({ type: 'smallint', nullable: true })
  gender: number;

  @ApiProperty({ description: '生日', example: '1990-01-01', required: false })
  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @ApiProperty({ description: '用户状态(0:禁用,1:启用)', example: 1 })
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间' })
  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => UserAuth, (userAuth) => userAuth.user)
  auths: UserAuth[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  // 添加与团队的关联
  @OneToMany(() => UserTeam, (userTeam) => userTeam.user)
  teams: UserTeam[];
}
