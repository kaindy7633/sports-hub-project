# Redis整合重构实现指南

我已经为你设计了一个完整的Redis整合方案，使用官方推荐的ioredis库替换之前的实现。下面是实施这个方案的步骤指南。

## 1. 安装依赖

首先，安装必要的依赖：

```bash
npm uninstall cache-manager-ioredis-yet cache-manager
npm install ioredis@5.6.1
```

## 2. 目录结构创建

创建以下目录和文件结构：

src/core/redis/
├── redis.config.ts        # Redis配置文件
├── redis.constants.ts     # 常量定义
├── redis.module.ts        # Redis模块
└── redis.service.ts       # Redis服务

## 3. 文件实现

按照提供的文件内容，依次实现各个组件：

先创建redis.constants.ts和redis.config.ts
然后实现redis.service.ts和redis.module.ts
修改现有的cache.service.ts和cache.module.ts

## 4. 环境变量配置

更新src/config/.env.development文件，添加Redis相关配置：

```yaml
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=sports-hub:
REDIS_TTL=3600
```

## 5. 更新核心模块

修改src/core/core.module.ts，导入新的Redis模块：

```typescript
@Module({
  imports: [
    // ...其他模块
    RedisModule.forRoot(),
    CacheModule,
  ],
  exports: [/* ... */, RedisModule],
})
export class CoreModule {}
```

## 6. 添加调试工具

部署RedisDebugController以便测试和排查问题，将其添加到PingModule中。

## 7. 测试验证

部署代码后，可以通过以下方式测试Redis连接是否正常工作：

访问 /api/v1/debug/redis 测试连接
访问 /api/v1/debug/redis/info 查看Redis服务器信息
访问 /api/v1/debug/redis/keys 查看所有键
访问 /api/v1/debug/redis/test-verification-code?phone=13800138000&code=123456 测试验证码功能

## 8. 运行独立测试脚本

如果仍然有问题，可以运行独立的test-redis.js脚本来检查Redis连接：

```bash
# 首先安装必要的依赖
npm install ioredis
# 运行测试脚本
node test-redis.js
```

## 9. 验证缓存服务中的验证码功能

使用新增的端点验证验证码功能：

```bash
# 设置验证码
curl 'http://localhost:9000/api/v1/debug/redis/test-verification-code?phone=13800138000&code=123456'

# 查看所有验证码
curl 'http://localhost:9000/api/v1/debug/redis/verification-codes'
```

## 故障排查

如果仍然无法正常工作，可能的问题原因：

连接问题：检查Redis服务是否正常运行，端口是否正确
授权问题：检查密码设置是否正确
数据库索引：确保使用了正确的数据库索引(DB)
键前缀：检查键前缀是否一致
TTL设置：验证码的TTL可能过短
通过调试端点返回的详细信息，通常可以找到具体的问题所在。

重要提示
此实现方案将缓存服务(CacheService)与Redis服务(RedisService)解耦，CacheService现在依赖于RedisService
RedisService提供了更多的功能，并添加了详细的日志记录
键前缀统一设置，避免了手动拼接的问题
提供了功能齐全的调试工具，用于排查问题
根据需要可以直接使用RedisService来替代CacheService
