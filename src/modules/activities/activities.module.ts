// src/modules/activities/activities.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { Team } from '../teams/entities/team.entity';
import { ActivityTeam } from './entities/activity-team.entity';
import { ActivityTeamsService } from './activity-teams.service';
import { ActivityTeamsController } from './activity-teams.controller';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';
// 导入 TokenModule (包含 TokenService)
import { TokenModule } from '../../core/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Team, ActivityTeam]),
    SnowflakeModule,
    TokenModule, // 导入 TokenModule，它应该提供 TokenService
  ],
  controllers: [ActivitiesController, ActivityTeamsController],
  providers: [ActivitiesService, ActivityTeamsService],
  exports: [ActivitiesService, ActivityTeamsService],
})
export class ActivitiesModule {}
