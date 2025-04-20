// database/migrations/1744644465951-RemoveTeamIdFromActivities.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTeamIdFromActivities1744644465951
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 先检查外键约束
    const foreignKeys = await queryRunner.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'activities' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%team%'
    `);

    // 如果存在外键约束，先删除
    if (foreignKeys && foreignKeys.length > 0) {
      for (const fk of foreignKeys) {
        await queryRunner.query(`
          ALTER TABLE activities DROP CONSTRAINT "${fk.constraint_name}"
        `);
      }
    }

    // 移除 team_id 字段
    await queryRunner.query(`
      ALTER TABLE activities DROP COLUMN IF EXISTS team_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 恢复 team_id 字段
    await queryRunner.query(`
      ALTER TABLE activities ADD COLUMN team_id BIGINT;
      
      -- 添加外键约束
      ALTER TABLE activities ADD CONSTRAINT fk_activities_team
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
    `);
  }
}
