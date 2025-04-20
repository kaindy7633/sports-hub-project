// database/migrations/1744644465950-CreateActivityTeamTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityTeamTable1744644465950
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查teams表的id字段类型
    const teamsTable = await queryRunner.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teams' AND column_name = 'id'
    `);

    // 确定teams表的id字段类型
    const isTeamIdUuid =
      teamsTable.length > 0 && teamsTable[0].data_type === 'uuid';
    const teamIdType = isTeamIdUuid ? 'UUID' : 'BIGINT';

    // 创建活动-团队关联表
    await queryRunner.query(`
      CREATE TABLE activity_team (
          activity_id BIGINT NOT NULL,
          team_id ${teamIdType} NOT NULL,
          role VARCHAR(50),
          is_host BOOLEAN NOT NULL DEFAULT false,
          joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (activity_id, team_id)
      );

      COMMENT ON COLUMN activity_team.activity_id IS '活动ID，关联activities表的id';
      COMMENT ON COLUMN activity_team.team_id IS '团队ID，关联teams表的id';
      COMMENT ON COLUMN activity_team.role IS '团队在活动中的角色，如主队、客队等';
      COMMENT ON COLUMN activity_team.is_host IS '是否是主办方/发起方';
      COMMENT ON COLUMN activity_team.joined_at IS '团队加入活动的时间';
      COMMENT ON COLUMN activity_team.created_at IS '创建时间';
      COMMENT ON COLUMN activity_team.updated_at IS '更新时间';
      COMMENT ON TABLE activity_team IS '活动-团队多对多关系的中间表，记录活动与团队的关联关系';

      -- 创建索引
      CREATE INDEX idx_activity_team_activity ON activity_team(activity_id);
      CREATE INDEX idx_activity_team_team ON activity_team(team_id);

      -- 添加外键约束
      ALTER TABLE activity_team ADD CONSTRAINT fk_activity_team_activity 
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;
      
      ALTER TABLE activity_team ADD CONSTRAINT fk_activity_team_team 
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

      -- 创建更新时间触发器
      CREATE TRIGGER update_activity_team_updated_at
      BEFORE UPDATE ON activity_team
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除触发器和表
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_activity_team_updated_at ON activity_team;
      DROP TABLE IF EXISTS activity_team CASCADE;
    `);
  }
}
