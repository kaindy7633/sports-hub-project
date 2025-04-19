# SportsHub 数据库迁移指南

本文档提供了使用 TypeORM 进行数据库迁移的完整指南，包括迁移的创建、执行和回滚等操作。

## 目录结构

```text
database/
├── migrations/           # 迁移文件目录
├── seeds/                # 种子数据目录
├── .migraterc            # 迁移配置文件
├── CHANGELOG.md          # 数据库变更日志
└── README.md             # 本文档
```

## 迁移命令

以下是可用的迁移命令，这些命令已经在 `package.json` 中配置好：

### 生成迁移文件

```bash
# 根据实体类与数据库的差异自动生成迁移文件
npm run migration:generate -- -n MigrationName

# 创建空白迁移文件
npm run migration:create -- -n MigrationName
```

### 执行迁移

```bash
# 执行所有未执行的迁移
npm run migration:run

# 查看迁移状态
npm run migration:show

# 检查待执行的迁移（不实际执行）
npm run migration:check
```

### 回滚迁移

```bash
# 回滚最近一次迁移
npm run migration:revert
```

## 迁移最佳实践

### 命名规范

迁移文件应遵循以下命名规范：

| 变更类型          | 命名模式                     | 示例                          |
|-------------------|----------------------------|-------------------------------|
| 新建表            | Create[TableName]Table     | CreateOrdersTable            |
| 添加字段          | Add[Columns]To[TableName]  | AddEmailToUsers              |
| 修改字段          | Change[Column]On[TableName]| ChangePhoneTypeOnVenues      |
| 数据迁移          | Seed[Description]          | SeedDefaultActivityTypes     |

### 编写迁移文件

每个迁移文件必须实现 `MigrationInterface` 接口，包含 `up` 和 `down` 两个方法：

- `up`: 执行迁移时要进行的操作
- `down`: 回滚迁移时要进行的操作

示例：

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastLoginToManagers1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE managers 
      ADD COLUMN last_login TIMESTAMP,
      ADD COLUMN login_count INT NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE managers 
      DROP COLUMN last_login,
      DROP COLUMN login_count;
    `);
  }
}
```

### 迁移注意事项

1. **始终提供回滚方法**：确保每个迁移的 `down` 方法能够完全撤销 `up` 方法的操作。
2. **保持迁移幂等**：迁移应该能够多次执行而不产生错误，例如使用 `IF NOT EXISTS` 或 `IF EXISTS` 子句。
3. **避免大型迁移**：将大型变更拆分为多个小型迁移，以减少执行时间和风险。
4. **测试迁移**：在应用到生产环境之前，确保在测试环境中测试迁移。
5. **记录变更**：在 `CHANGELOG.md` 中记录所有数据库变更。

## 实体类与迁移

实体类定义在 `src/core/database/entities` 目录下，用于定义数据库表的结构。当实体类发生变化时，可以使用 `migration:generate` 命令自动生成迁移文件。

## 紧急回滚流程

如果需要紧急回滚数据库变更，请按照以下步骤操作：

1. 备份当前数据：

   ```bash
   pg_dump -h localhost -U postgres -d sports-hub > backup.sql
   ```

2. 执行回滚：

   ```bash
   npm run migration:revert
   ```

3. 如需回滚到特定版本，请先查看迁移历史：

   ```bash
   npm run migration:show
   ```

   然后执行多次回滚直到达到目标版本。
