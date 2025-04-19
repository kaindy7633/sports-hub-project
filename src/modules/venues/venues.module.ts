import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { Venue } from './entities/venues.entity';
import { TokenModule } from '../../core/token/token.module';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venue]), TokenModule, SnowflakeModule],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
