// src/core/redis/redis.module.ts
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';
import redisConfig from './redis.config';

@Global()
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get('redis.host');
        const port = configService.get('redis.port');
        const password = configService.get('redis.password');
        const db = configService.get('redis.db');
        const keyPrefix = configService.get('redis.keyPrefix');

        console.log(
          `Connecting to Redis: ${host}:${port}, DB:${db}, Prefix:${keyPrefix}`,
        );

        const client = new Redis({
          host,
          port,
          password: password || undefined,
          db,
          keyPrefix,
          retryStrategy(times) {
            if (times > 3) {
              console.error(`Redis connection failed after ${times} retries`);
              return null; // 停止重试
            }
            const delay = Math.min(times * 200, 2000);
            console.log(`Retrying Redis connection in ${delay}ms...`);
            return delay;
          },
          showFriendlyErrorStack: true,
        });

        // 添加事件监听器以便调试
        client.on('connect', () => {
          console.log('Successfully connected to Redis');
        });

        client.on('error', (err) => {
          console.error('Redis connection error:', err);
        });

        client.on('ready', () => {
          console.log('Redis client ready');
        });

        return client;
      },
      inject: [ConfigService],
    };

    return {
      module: RedisModule,
      imports: [ConfigModule.forFeature(redisConfig)],
      providers: [redisProvider, RedisService],
      exports: [redisProvider, RedisService],
    };
  }
}
