// src/core/redis/redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly defaultTTL: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('redis.ttl', 3600);
  }

  /**
   * 获取缓存值
   * @param key 键名
   * @returns 缓存值或null
   */
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redisClient.get(key);
      this.logger.debug(`Redis GET: ${key} => ${value ? 'hit' : 'miss'}`);
      return value;
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取缓存值并解析为JSON对象
   * @param key 键名
   * @returns 解析后的对象或null
   */
  async getJSON<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(
        `Failed to parse JSON from Redis key ${key}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * 设置缓存
   * @param key 键名
   * @param value 值
   * @param ttl 过期时间(秒)，默认使用配置值
   * @returns 操作结果
   */
  async set(
    key: string,
    value: string | number | Buffer,
    ttl?: number,
  ): Promise<string> {
    try {
      let result: string;
      if (ttl !== undefined) {
        result = await this.redisClient.set(key, value, 'EX', ttl);
      } else {
        result = await this.redisClient.set(key, value, 'EX', this.defaultTTL);
      }
      this.logger.debug(
        `Redis SET: ${key} (TTL: ${ttl || this.defaultTTL}s) => ${result}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 设置JSON对象到缓存
   * @param key 键名
   * @param value 对象值
   * @param ttl 过期时间(秒)
   * @returns 操作结果
   */
  async setJSON<T = any>(key: string, value: T, ttl?: number): Promise<string> {
    return this.set(key, JSON.stringify(value), ttl);
  }

  /**
   * 删除缓存
   * @param key 键名
   * @returns 删除的键数量
   */
  async del(key: string): Promise<number> {
    try {
      const result = await this.redisClient.del(key);
      this.logger.debug(`Redis DEL: ${key} => ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 查找匹配模式的键
   * @param pattern 模式，如 user:*
   * @returns 匹配的键列表
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redisClient.keys(pattern);
      this.logger.debug(`Redis KEYS: ${pattern} => ${keys.length} keys found`);
      return keys;
    } catch (error) {
      this.logger.error(
        `Redis KEYS error for pattern ${pattern}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * 设置键的过期时间
   * @param key 键名
   * @param seconds 过期时间(秒)
   * @returns 操作结果(1成功，0键不存在)
   */
  async expire(key: string, seconds: number): Promise<number> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      this.logger.debug(`Redis EXPIRE: ${key} ${seconds}s => ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}: ${error.message}`);
      return 0;
    }
  }

  /**
   * 获取键的剩余过期时间
   * @param key 键名
   * @returns 剩余秒数，-1表示永不过期，-2表示键不存在
   */
  async ttl(key: string): Promise<number> {
    try {
      const result = await this.redisClient.ttl(key);
      this.logger.debug(`Redis TTL: ${key} => ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Redis TTL error for key ${key}: ${error.message}`);
      return -2;
    }
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取Redis客户端实例
   * 谨慎使用，仅在需要直接操作Redis客户端时使用
   */
  getClient(): Redis {
    return this.redisClient;
  }
}
