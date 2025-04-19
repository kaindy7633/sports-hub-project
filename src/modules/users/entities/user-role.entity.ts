import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('user_roles')
export class UserRole {
  @ApiProperty({ description: '用户ID', example: '1' })
  @PrimaryColumn('bigint')
  user_id: bigint;

  @ApiProperty({ description: '角色ID', example: '1' })
  @PrimaryColumn('bigint')
  role_id: bigint;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '用户信息', type: () => User })
  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '角色信息', type: () => Role })
  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
