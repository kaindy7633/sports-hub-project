# NestJS 异常处理最佳实践指南

本文档提供了项目中异常处理的使用指南和示例，帮助开发人员正确使用异常处理机制。

## 异常处理体系概述

项目中已实现完整的异常处理体系，包括：

1. **全局异常过滤器**：捕获所有未处理的异常
2. **验证异常过滤器**：专门处理输入验证错误
3. **业务异常基类**：用于创建自定义业务异常
4. **标准响应格式**：确保所有错误响应格式一致

## 如何使用

### 1. 抛出 HTTP 异常

使用 NestJS 内置的 HTTP 异常类型：

```typescript
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    // 参数验证
    if (!isValidUUID(id)) {
      throw new BadRequestException('无效的用户ID格式');
    }
    
    const user = this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    
    return user;
  }
}
```

### 2. 使用自定义业务异常

```typescript
import { ResourceNotFoundException } from '../common/exceptions/resource-not-found.exception';
import { BusinessException } from '../common/exceptions/business.exception';

@Controller('teams')
export class TeamsController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const team = await this.teamsService.findById(id);
      if (!team) {
        throw new ResourceNotFoundException('Team', id);
      }
      return team;
    } catch (error) {
      if (error instanceof DatabaseError) {
        // 转换为业务异常并保留原始错误信息
        throw new BusinessException(
          '查询球队信息失败',
          10004, // 自定义错误码
          error // 传递原始错误作为 cause
        );
      }
      throw error; // 重新抛出其他错误
    }
  }
}
```

### 3. 创建自定义业务异常类

创建特定业务场景的异常类：

```typescript
import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

export class InsufficientPermissionException extends BusinessException {
  constructor(resource: string, action: string, cause?: Error) {
    super(
      `无权${action}${resource}`,
      10005, // 权限错误码
      cause
    );
  }
}
```

## 错误码规范

项目使用以下错误码规范：

- **10001**: 通用业务异常
- **10002**: 资源未找到
- **10003**: 输入验证错误
- **10004**: 数据操作异常
- **10005**: 权限不足

## 响应示例

标准错误响应格式：

```json
{
  "statusCode": 400,
  "message": "球队资源未找到：123",
  "code": 10002,
  "path": "/api/v1/teams/123",
  "timestamp": "2023-08-10T12:30:45.123Z"
}
```

## 注意事项

1. 不要直接在响应中返回敏感的错误详情
2. 生产环境中会自动隐藏错误堆栈信息
3. 始终使用适当的状态码和业务错误码
4. 传递原始错误作为 cause 以便日志中保留完整错误上下文
