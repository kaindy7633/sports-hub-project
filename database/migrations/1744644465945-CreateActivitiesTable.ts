import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable1744644465945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建活动表
    await queryRunner.query(`
      CREATE TABLE activities (
          id BIGSERIAL PRIMARY KEY,
          activity_id BIGINT NOT NULL,
          title VARCHAR(100) NOT NULL,
          type_id BIGINT NOT NULL,
          venue_id BIGINT NOT NULL,
          creator_id BIGINT NOT NULL,
          team_id BIGINT,
          description TEXT,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          max_participants INT NOT NULL DEFAULT 0,
          current_participants INT NOT NULL DEFAULT 0,
          fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          status SMALLINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );

      COMMENT ON COLUMN activities.id IS '活动ID';
      COMMENT ON COLUMN activities.activity_id IS '业务活动ID';
      COMMENT ON COLUMN activities.title IS '活动标题';
      COMMENT ON COLUMN activities.type_id IS '活动类型ID';
      COMMENT ON COLUMN activities.venue_id IS '场地ID';
      COMMENT ON COLUMN activities.creator_id IS '创建者ID';
      COMMENT ON COLUMN activities.team_id IS '关联团队ID';
      COMMENT ON COLUMN activities.description IS '活动描述';
      COMMENT ON COLUMN activities.start_time IS '开始时间';
      COMMENT ON COLUMN activities.end_time IS '结束时间';
      COMMENT ON COLUMN activities.max_participants IS '最大参与人数，0表示不限制';
      COMMENT ON COLUMN activities.current_participants IS '当前参与人数';
      COMMENT ON COLUMN activities.fee IS '参与费用';
      COMMENT ON COLUMN activities.status IS '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束';
      COMMENT ON COLUMN activities.created_at IS '创建时间';
      COMMENT ON COLUMN activities.updated_at IS '更新时间';
      COMMENT ON COLUMN activities.deleted_at IS '删除时间';
      COMMENT ON TABLE activities IS '活动表，存储系统中的各种活动信息';

      CREATE TRIGGER update_activities_updated_at
      BEFORE UPDATE ON activities
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS activities CASCADE;`);
  }
}
