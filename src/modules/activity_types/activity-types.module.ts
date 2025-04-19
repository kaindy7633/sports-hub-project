import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTypesService } from './activity-types.service';
import { ActivityTypesController } from './activity-types.controller';
import { ActivityType } from './entities/activity-type.entity';
import { TokenModule } from '../../core/token/token.module';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityType]),
    TokenModule,
    SnowflakeModule,
  ],
  controllers: [ActivityTypesController],
  providers: [ActivityTypesService],
  exports: [ActivityTypesService],
})
export class ActivityTypesModule {}
