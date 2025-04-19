// src/modules/ping/ping.module.ts
import { Module } from '@nestjs/common';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';
import { RedisModule } from '../../core/redis/redis.module';
import { CacheModule } from '../../core/cache/cache.module';
import { RedisDebugController } from './redis-debug.controller';

@Module({
  imports: [RedisModule.forRoot(), CacheModule],
  controllers: [PingController, RedisDebugController],
  providers: [PingService],
  exports: [PingService],
})
export class PingModule {}
