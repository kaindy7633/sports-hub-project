// src/core/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule.forRoot()],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
