// src/modules/teams/entities/user-team.entity.ts
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Team } from './team.entity';

@Entity('user_team')
export class UserTeam {
  @ApiProperty({ description: '用户ID', example: '1' })
  @PrimaryColumn('bigint')
  user_id: bigint;

  @ApiProperty({ description: '团队ID', example: '1' })
  @PrimaryColumn('bigint')
  team_id: bigint;

  @ApiProperty({
    description: '用户在团队中的角色',
    example: 'member',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  role: string;

  @ApiProperty({ description: '用户加入团队的时间' })
  @Column()
  joined_at: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '用户信息', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: '团队信息', type: () => Team })
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
