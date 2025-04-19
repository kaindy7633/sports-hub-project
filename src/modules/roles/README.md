# 角色模块实现指南

## 模块概述

角色模块（RolesModule）实现了系统中的角色管理功能，包括角色的创建、查询、更新、删除以及角色分配等功能。该模块与用户模块密切相关，实现了用户与角色的多对多关联关系。

## 文件结构

```text
src/modules/roles/
├── dto/                       # 数据传输对象
│   ├── create-role.dto.ts     # 角色创建DTO
│   ├── update-role.dto.ts     # 角色更新DTO
│   ├── query-role.dto.ts      # 角色查询DTO
│   ├── assign-role.dto.ts     # 角色分配DTO
│   └── role-response.dto.ts   # 角色响应DTO
├── entities/                  # 实体定义
│   └── role.entity.ts         # 角色实体
├── roles.controller.ts        # 角色控制器
├── roles.service.ts           # 角色服务
└── roles.module.ts            # 角色模块定义
```

## 实现功能

1. **角色管理**：
   - 创建角色：`POST /roles`
   - 分页查询角色：`GET /roles?name=&code=&status=&pageNum=1&pageSize=10`
   - 获取所有角色（不分页）：`GET /roles/all`
   - 获取角色详情：`GET /roles/:id`
   - 更新角色：`PATCH /roles/:id`
   - 删除角色：`DELETE /roles/:id`

2. **角色分配**：
   - 给用户分配角色：`POST /roles/assign/:userId`
   - 批量分配用户角色：`POST /roles/batch-assign`
   - 获取用户的角色列表：`GET /roles/user/:userId`

## 数据库表关系

角色模块涉及两个主要表：

- `roles`：存储角色基本信息
- `user_roles`：存储用户与角色的关联关系（多对多）

## 安装部署步骤

1. 确保已有正确的数据库表结构（参考 `docs/schema.sql`）

2. 复制相关文件到项目中：

   ```bash
   # 创建必要的目录
   mkdir -p src/modules/roles/dto
   mkdir -p src/modules/roles/entities
   
   # 复制文件到对应目录
   ```

3. 确保在 `app.module.ts` 中引入 `RolesModule`：

   ```typescript
   import { RolesModule } from './modules/roles/roles.module';
   
   @Module({
     imports: [
       // 其他模块...
       RolesModule,
     ],
   })
   export class AppModule {}
   ```

4. 重启应用，访问 `/api/v1/docs` 查看新增的角色管理API

## 使用示例

1. **创建角色**：

   ```http
   POST /api/v1/roles
   Content-Type: application/json
   
   {
     "name": "系统管理员",
     "code": "admin",
     "description": "系统管理员，拥有所有权限",
     "status": 1
   }
   ```

2. **为用户分配角色**：

   ```http
   POST /api/v1/roles/assign/1
   Content-Type: application/json
   
   {
     "roleIds": [1, 2]
   }
   ```

3. **查询用户角色**：

   ```http
   GET /api/v1/roles/user/1
   ```

## 注意事项

1. 角色编码（code）必须唯一，创建和更新时会进行唯一性校验
2. 已分配给用户的角色不能删除，需要先解除关联关系
3. 角色状态为 0 时表示禁用，为 1 时表示启用
4. 角色删除采用软删除方式，不会真正从数据库删除数据

## 扩展建议

1. 增加权限管理功能，实现RBAC（基于角色的访问控制）
2. 添加角色组功能，支持角色的分组管理
3. 实现角色数据权限控制，对不同角色设置不同的数据访问范围
4. 增加角色操作日志，记录角色的创建、修改、删除等操作
