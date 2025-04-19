// src/modules/ping/redis-debug.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RedisService } from '../../core/redis/redis.service';
import { CacheService } from '../../core/cache/cache.service';

@ApiTags('debug')
@Controller('debug/redis')
export class RedisDebugController {
  constructor(
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Redis连接测试' })
  async ping() {
    try {
      const client = this.redisService.getClient();
      const pong = await client.ping();
      return {
        status: 'success',
        message: `Redis responded: ${pong}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Redis ping failed: ${error.message}`,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('info')
  @ApiOperation({ summary: '获取Redis服务器信息' })
  async getInfo() {
    try {
      const client = this.redisService.getClient();
      const info = await client.info();
      const infoLines = info.split('\n');

      // 筛选有用信息
      const filteredInfo = infoLines.filter(
        (line) =>
          line.includes('redis_version') ||
          line.includes('connected_clients') ||
          line.includes('used_memory_human') ||
          line.includes('db0') ||
          line.includes('uptime'),
      );

      return {
        status: 'success',
        redisInfo: filteredInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get Redis info: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('keys')
  @ApiOperation({ summary: '获取匹配的键' })
  @ApiQuery({
    name: 'pattern',
    description: '匹配模式',
    required: false,
    example: '*',
  })
  async getKeys(@Query('pattern') pattern: string = '*') {
    try {
      const keys = await this.redisService.keys(pattern);
      return {
        status: 'success',
        count: keys.length,
        keys: keys,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get Redis keys: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('key/:key')
  @ApiOperation({ summary: '获取指定键的值' })
  @ApiParam({ name: 'key', description: '键名' })
  async getKey(@Param('key') key: string) {
    try {
      const value = await this.redisService.get(key);
      const ttl = await this.redisService.ttl(key);

      return {
        status: 'success',
        key,
        exists: value !== null,
        type: typeof value,
        value,
        ttl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get Redis key: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-set')
  @ApiOperation({ summary: '测试设置值' })
  @ApiQuery({
    name: 'key',
    description: '键名',
    required: true,
    example: 'test:key',
  })
  @ApiQuery({
    name: 'value',
    description: '值',
    required: true,
    example: 'test-value',
  })
  @ApiQuery({
    name: 'ttl',
    description: '过期时间(秒)',
    required: false,
    example: '60',
  })
  async testSet(
    @Query('key') key: string,
    @Query('value') value: string,
    @Query('ttl') ttl?: number,
  ) {
    try {
      await this.redisService.set(key, value, ttl);
      const storedValue = await this.redisService.get(key);
      const storedTTL = await this.redisService.ttl(key);

      return {
        status: 'success',
        key,
        requestedValue: value,
        storedValue,
        requestedTTL: ttl,
        storedTTL,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to set Redis key: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('verification-codes')
  @ApiOperation({ summary: '获取所有验证码' })
  async getVerificationCodes() {
    try {
      const codes = await this.cacheService.getAllVerificationCodes();
      return {
        status: 'success',
        count: Object.keys(codes).length,
        codes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to get verification codes: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-verification-code')
  @ApiOperation({ summary: '测试验证码设置' })
  @ApiQuery({
    name: 'phone',
    description: '手机号',
    required: true,
    example: '13800138000',
  })
  @ApiQuery({
    name: 'code',
    description: '验证码',
    required: true,
    example: '123456',
  })
  async testVerificationCode(
    @Query('phone') phone: string,
    @Query('code') code: string,
  ) {
    try {
      // 设置验证码
      await this.cacheService.setVerificationCode(phone, code, 300);

      // 尝试获取验证码
      const storedCode = await this.cacheService.getVerificationCode(phone);

      // 直接用Redis服务获取，看原始值
      const key = `verification:${phone}`;
      const rawValue = await this.redisService.get(key);
      const ttl = await this.redisService.ttl(key);

      return {
        status: 'success',
        phone,
        requestedCode: code,
        cacheServiceResult: storedCode,
        redisServiceResult: rawValue,
        ttl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to test verification code: ${error.message}`,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
