# Swagger API文档集成说明

## 概述

SportsHub项目集成了Swagger工具来自动生成API文档。Swagger为前后端开发人员提供了直观的API测试和查看界面，使API文档与代码保持同步。

## 访问方式

启动应用后，可通过以下URL访问Swagger文档：

```text
http://localhost:9000/api/v1/docs
```

## 主要功能

- 可视化API接口清单
- 在线测试API接口
- 查看请求和响应的数据模型
- 查看API参数说明
- JWT身份验证支持

## 开发指南

### DTO类装饰

在DTO类中使用`@ApiProperty`装饰器来定义字段属性：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'johndoe' })
  username: string;
  
  // 其他属性...
}
```

### 控制器装饰

在控制器中使用Swagger装饰器来标注API：

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users') // 添加标签分组
@Controller('users')
export class UsersController {
  
  @Post()
  @ApiOperation({ summary: '创建新用户' }) // 操作摘要
  @ApiResponse({ status: 201, description: '用户创建成功' }) // 响应说明
  create(@Body() createUserDto: CreateUserDto) {
    // 实现代码...
  }
  
  // 其他方法...
}
```

### 安全配置

在API中使用JWT认证：

```typescript
@ApiBearerAuth('JWT-auth')
@Controller('resource')
export class ResourceController {
  // 实现代码...
}
```

## 配置文件

Swagger配置位于`src/config/swagger.config.ts`文件中，包含了文档标题、描述、版本等信息。如需修改文档配置，请编辑该文件。
