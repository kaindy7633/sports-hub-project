// src/modules/activities/entities/activity-team.entity.ts
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
import { Team } from '../../teams/entities/team.entity';
import { Activity } from './activity.entity';

@Entity('activity_team')
export class ActivityTeam {
  @ApiProperty({ description: '活动ID', example: '1' })
  @PrimaryColumn('bigint')
  activity_id: bigint;

  @ApiProperty({ description: '团队ID', example: '1' })
  @PrimaryColumn('bigint') // 或 'uuid' 取决于实际的teams表id类型
  team_id: bigint | string; // 类型取决于teams表的id类型

  @ApiProperty({
    description: '团队在活动中的角色',
    example: 'host',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  role: string;

  @ApiProperty({ description: '是否是主办方/发起方', example: true })
  @Column({ default: false })
  is_host: boolean;

  @ApiProperty({ description: '团队加入活动的时间' })
  @Column()
  joined_at: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '活动信息', type: () => Activity })
  @ManyToOne(() => Activity, (activity) => activity.teamActivities)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @ApiProperty({ description: '团队信息', type: () => Team })
  @ManyToOne(() => Team, (team) => team.activityTeams)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
