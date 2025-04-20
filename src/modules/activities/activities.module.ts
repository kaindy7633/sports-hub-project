// src/modules/activities/activities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { Team } from '../teams/entities/team.entity';
// 添加 ActivityTeam 实体和服务
import { ActivityTeam } from './entities/activity-team.entity';
import { ActivityTeamsService } from './activity-teams.service';
import { ActivityTeamsController } from './activity-teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Team, ActivityTeam]), // 添加 ActivityTeam
  ],
  controllers: [
    ActivitiesController,
    ActivityTeamsController, // 添加 ActivityTeamsController
  ],
  providers: [
    ActivitiesService,
    ActivityTeamsService, // 添加 ActivityTeamsService
  ],
  exports: [ActivitiesService, ActivityTeamsService], // 导出服务
})
export class ActivitiesModule {}
