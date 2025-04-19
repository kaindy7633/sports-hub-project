import { Controller, Get } from '@nestjs/common';
import { PingService } from './ping.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheService } from '../../core/cache/cache.service';

@ApiTags('ping')
@Controller()
export class PingController {
  constructor(
    private readonly pingService: PingService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: '健康检查接口' })
  @ApiResponse({ status: 200, description: '返回服务器状态信息' })
  getPing(): string {
    return this.pingService.getPing();
  }

  /**
   * Redis连接测试
   * @returns 测试结果
   * @returns
   */
  @Get('ping/redis')
  @ApiOperation({ summary: 'Redis连接测试' })
  @ApiResponse({ status: 200, description: '测试Redis连接并返回结果' })
  async testRedisConnection() {
    const testKey = 'test:redis:connection';
    const testValue = `connected-${Date.now()}`;

    try {
      // 写入测试值
      await this.cacheService.set(testKey, testValue, 300);

      // 读取测试值
      const retrieved = await this.cacheService.get(testKey);

      console.log('写入值:', testValue);
      console.log('读取值:', retrieved);

      // 检查是否匹配
      const isSuccess = retrieved === testValue;

      return {
        status: isSuccess ? 'success' : 'failure',
        message: isSuccess
          ? 'Redis连接正常，缓存读写成功'
          : `Redis缓存读写不匹配: 写入=${testValue}, 读取=${retrieved}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Redis连接测试失败: ${error.message}`,
        error: error.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 详细的Redis连接测试
   * @returns 测试结果
   */
  @Get('ping/redis-details')
  @ApiOperation({ summary: '详细的Redis连接测试' })
  @ApiResponse({ status: 200, description: '提供详细的Redis连接和存储信息' })
  async testRedisConnectionDetails() {
    const results: Record<string, any>[] = [];
    const testKeyBase = 'test:redis:connection';

    try {
      // 1. 测试原始set/get方法
      const testKey1 = `${testKeyBase}:basic`;
      const testValue1 = `basic-${Date.now()}`;
      await this.cacheService.set(testKey1, testValue1, 300);
      const retrieved1 = await this.cacheService.get(testKey1);
      results.push({
        test: 'Basic Set/Get',
        key: testKey1,
        expectedValue: testValue1,
        actualValue: retrieved1,
        success: retrieved1 === testValue1,
      });

      // 2. 测试验证码相关方法
      const fakePhone = '13800138000';
      const fakeCode = '123456';
      await this.cacheService.setVerificationCode(fakePhone, fakeCode, 300);
      const retrievedCode =
        await this.cacheService.getVerificationCode(fakePhone);
      results.push({
        test: 'Verification Code Set/Get',
        key: `verification:${fakePhone}`,
        expectedValue: fakeCode,
        actualValue: retrievedCode,
        success: retrievedCode === fakeCode,
      });

      // 3. 使用原始Cache Manager尝试获取验证码
      // 这能看到实际Redis中的键名
      const cacheManager = this.cacheService['cacheManager'];
      const rawRetrieval = await cacheManager.get(`verification:${fakePhone}`);
      results.push({
        test: 'Raw Cache Manager Get',
        key: `verification:${fakePhone}`,
        actualValue: rawRetrieval,
        success: rawRetrieval === fakeCode,
      });

      // 4. 尝试使用Redis命令获取所有键
      // 注意：这需要访问底层RedisClient，可能需要额外配置
      try {
        const store: any = cacheManager.stores;
        // 尝试访问底层客户端
        let keys;
        if (store.client && typeof store.client.keys === 'function') {
          keys = await store.client.keys('*');
          results.push({
            test: 'List All Redis Keys',
            keys: keys,
          });
        } else {
          results.push({
            test: 'List All Redis Keys',
            error: 'Cannot access Redis client directly',
          });
        }
      } catch (error) {
        results.push({
          test: 'List All Redis Keys',
          error: error.message,
        });
      }

      return {
        status: 'completed',
        overallSuccess: results.every((r) => r.success !== false),
        testResults: results,
        redisConfig: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          db: parseInt(process.env.REDIS_DB || '0', 10),
          keyPrefix: process.env.REDIS_PREFIX || 'sports-hub_',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Redis连接测试失败: ${error.message}`,
        error: error.stack,
        results: results,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
