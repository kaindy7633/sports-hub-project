// src/modules/teams/entities/team.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserTeam } from './user-team.entity';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

// 导入 ActivityTeam
import { ActivityTeam } from '../../activities/entities/activity-team.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('teams')
export class Team {
  @ApiProperty({ description: '团队ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务团队ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
    unique: true,
  })
  team_id: string;

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

  @ApiProperty({ description: '队长ID', example: '1' })
  @Column({ type: 'bigint' })
  leader_id: bigint;

  @ApiProperty({ description: '最大成员数', example: 20 })
  @Column({ default: 0 })
  max_members: number;

  @ApiProperty({ description: '当前成员数', example: 10 })
  @Column({ default: 0 })
  current_members: number;

  @ApiProperty({ description: '状态：0-解散，1-正常', example: 1 })
  @Column({ type: 'smallint', default: 1 })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @Column({ nullable: true })
  deleted_at: Date;

  // 关联用户-团队中间表
  @OneToMany(() => UserTeam, (userTeam) => userTeam.team)
  userTeams: UserTeam[];

  // 关联活动
  // @OneToMany(() => Activity, (activity) => activity.team)
  // activities: Activity[];

  // 添加新的多对多关联
  @ApiProperty({
    description: '团队参与的活动关联',
    type: () => ActivityTeam,
    isArray: true,
  })
  @OneToMany(() => ActivityTeam, (activityTeam) => activityTeam.team)
  activityTeams: ActivityTeam[];

  // 添加一个便捷方法来获取所有关联的活动
  get activities(): Activity[] {
    return (
      this.activityTeams?.map((activityTeam) => activityTeam.activity) || []
    );
  }
}
