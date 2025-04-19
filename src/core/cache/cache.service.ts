// src/core/cache/cache.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly verificationPrefix = 'verification:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      await this.redisService.set(key, value, ttl);
      this.logger.debug(`Cache set: ${key}, TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.redisService.get(key);
      if (!value) return undefined;

      try {
        return JSON.parse(value) as T;
      } catch {
        // 如果不是JSON格式，则按原样返回
        return value as unknown as T;
      }
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}: ${error.message}`);
      return undefined;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async del(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete cache for key ${key}: ${error.message}`,
      );
    }
  }

  /**
   * 设置验证码
   * @param phone 手机号
   * @param code 验证码
   * @param ttl 过期时间（秒），默认300秒(5分钟)
   */
  async setVerificationCode(
    phone: string,
    code: string,
    ttl: number = 300,
  ): Promise<void> {
    const key = this.getVerificationKey(phone);
    await this.set(key, code, ttl);
    this.logger.log(
      `Verification code set for ${phone}: ${code}, expires in ${ttl}s`,
    );

    // 检查是否成功设置了验证码
    const stored = await this.getVerificationCode(phone);
    this.logger.log(
      `Verification check - Stored value for ${phone}: ${stored}`,
    );
  }

  /**
   * 获取验证码
   * @param phone 手机号
   * @returns 验证码
   */
  async getVerificationCode(phone: string): Promise<string | undefined> {
    const key = this.getVerificationKey(phone);
    const code = await this.redisService.get(key);
    this.logger.debug(
      `Retrieved verification code for ${phone}: ${code || 'not found'}`,
    );
    return code || undefined;
  }

  /**
   * 删除验证码
   * @param phone 手机号
   */
  async delVerificationCode(phone: string): Promise<void> {
    const key = this.getVerificationKey(phone);
    await this.del(key);
  }

  /**
   * 获取所有验证码
   * 用于调试
   */
  async getAllVerificationCodes(): Promise<Record<string, string>> {
    const keys = await this.redisService.keys(`${this.verificationPrefix}*`);
    const result: Record<string, string> = {};

    for (const key of keys) {
      const value = await this.redisService.get(key);
      if (value) {
        // 去掉前缀，获取手机号
        const phone = key.replace(this.verificationPrefix, '');
        result[phone] = value;
      }
    }

    return result;
  }

  /**
   * 获取验证码的Redis键名
   * @param phone 手机号
   * @returns Redis键名
   */
  private getVerificationKey(phone: string): string {
    return `${this.verificationPrefix}${phone}`;
  }
}
