import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { AdminAuthController } from './admin-auth.controller';
import { Manager } from './entities/manager.entity';
import { CoreModule } from '../../core/core.module';
import { TokenModule } from '../../core/token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Manager]), CoreModule, TokenModule],
  controllers: [ManagersController, AdminAuthController],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagersModule {}
