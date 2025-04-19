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
import { UserRole } from '../../users/entities/user-role.entity';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

@Entity('roles')
export class Role {
  @ApiProperty({ description: '角色ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务角色ID', example: 10001 })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
    unique: true,
  })
  role_id: string;

  @ApiProperty({ description: '角色名称', example: '管理员' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: '角色编码', example: 'admin' })
  @Column({ length: 50 })
  code: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员，拥有所有权限',
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

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
