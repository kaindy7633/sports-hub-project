# 数据库变更日志

## 2024-07-XX - 初始化数据库结构

### 添加内容

- 创建 `update_modified_column()` 触发器函数，用于自动更新 `updated_at` 字段
- 创建系统管理员表 `managers`
  - 包含基本管理员信息字段
  - 添加自动更新 `updated_at` 的触发器
- 创建系统参数表 `sys_configs`
  - 用于存储系统级别的配置参数
  - 添加自动更新 `updated_at` 的触发器

### 迁移文件

- `1720000000000-InitSchema.ts` - 初始化数据库结构

### 实体类

- `manager.entity.ts` - 系统管理员实体类
- `sys-config.entity.ts` - 系统参数实体类
