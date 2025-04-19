import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityTypesTable1744644465944
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建活动类型表
    await queryRunner.query(`
      CREATE TABLE activity_types (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          code VARCHAR(50) NOT NULL,
          icon VARCHAR(255),
          description VARCHAR(255),
          status SMALLINT NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );

      COMMENT ON COLUMN activity_types.id IS '活动类型ID';
      COMMENT ON COLUMN activity_types.name IS '活动类型名称';
      COMMENT ON COLUMN activity_types.code IS '活动类型编码';
      COMMENT ON COLUMN activity_types.icon IS '活动类型图标';
      COMMENT ON COLUMN activity_types.description IS '活动类型描述';
      COMMENT ON COLUMN activity_types.status IS '状态：0-禁用，1-正常';
      COMMENT ON COLUMN activity_types.created_at IS '创建时间';
      COMMENT ON COLUMN activity_types.updated_at IS '更新时间';
      COMMENT ON COLUMN activity_types.deleted_at IS '删除时间';
      COMMENT ON TABLE activity_types IS '活动类型表，定义系统支持的各种活动类型';

      CREATE TRIGGER update_activity_types_updated_at
      BEFORE UPDATE ON activity_types
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_activity_types_updated_at ON activity_types;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS activity_types CASCADE;`);
  }
}
