import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { UserTeam } from './entities/user-team.entity';
import { User } from '../users/entities/user.entity';
import { TeamMembersService } from './team-members.service';
import { TeamMembersController } from './team-members.controller';
import { TokenModule } from '../../core/token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team, UserTeam, User]), TokenModule],
  controllers: [TeamsController, TeamMembersController],
  providers: [TeamsService, TeamMembersService],
  exports: [TeamsService, TeamMembersService],
})
export class TeamsModule {}
