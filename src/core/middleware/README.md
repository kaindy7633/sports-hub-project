# 中间件模块

本模块包含 SportsHub 项目使用的中间件组件。

## 日志中间件 (LoggingMiddleware)

全局日志中间件用于记录所有 HTTP 请求及响应信息，实现了以下功能：

- 记录请求方法、URL、查询参数和请求体（敏感数据自动脱敏）
- 生成唯一请求 ID 支持链路追踪
- 记录响应状态码和处理时间
- 基于状态码智能调整日志级别（4xx 为 warn，5xx 为 error）
- 使用 winston 实现结构化日志输出
- 支持多种日志输出目标（控制台、文件）
- 提供类中间件和函数中间件两种实现方式

### 使用方法

日志中间件已在 AppModule 中全局注册，应用于除健康检查外的所有路由。

```typescript
// 类中间件已在 AppModule 中注册
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .exclude(
        { path: 'ping', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL }
      )
      .forRoutes('*');
  }
}

// 或者使用函数中间件在 main.ts 中全局注册
app.use(loggingMiddleware);
```

### 日志配置

日志配置在 `logger.config.ts` 中管理，支持根据不同环境（开发、测试、生产）自动调整日志级别和输出目标。