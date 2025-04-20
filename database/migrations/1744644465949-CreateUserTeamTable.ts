// database/migrations/1744644465949-CreateUserTeamTable.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTeamTable1744644465949 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查teams表结构
    const teamsTable = await queryRunner.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'teams' AND column_name = 'id'
    `);

    // 确定teams表的id字段类型
    const isTeamIdUuid =
      teamsTable.length > 0 && teamsTable[0].data_type === 'uuid';
    const teamIdType = isTeamIdUuid ? 'UUID' : 'BIGINT';

    // 创建用户-团队关联表，使用正确的数据类型
    await queryRunner.query(`
      CREATE TABLE user_team (
          user_id BIGINT NOT NULL,
          team_id ${teamIdType} NOT NULL,
          role VARCHAR(50),
          joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, team_id)
      );

      COMMENT ON COLUMN user_team.user_id IS '用户ID，关联users表的id';
      COMMENT ON COLUMN user_team.team_id IS '团队ID，关联teams表的id';
      COMMENT ON COLUMN user_team.role IS '用户在团队中的角色';
      COMMENT ON COLUMN user_team.joined_at IS '用户加入团队的时间';
      COMMENT ON COLUMN user_team.created_at IS '创建时间';
      COMMENT ON COLUMN user_team.updated_at IS '更新时间';
      COMMENT ON TABLE user_team IS '用户-团队多对多关系的中间表，记录用户与团队的关联关系';

      -- 创建索引
      CREATE INDEX idx_user_team_user ON user_team(user_id);
      CREATE INDEX idx_user_team_team ON user_team(team_id);

      -- 添加外键约束
      ALTER TABLE user_team ADD CONSTRAINT fk_user_team_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      
      ALTER TABLE user_team ADD CONSTRAINT fk_user_team_team 
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

      -- 创建更新时间触发器
      CREATE TRIGGER update_user_team_updated_at
      BEFORE UPDATE ON user_team
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除触发器和表
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_user_team_updated_at ON user_team;
      DROP TABLE IF EXISTS user_team CASCADE;
    `);
  }
}
