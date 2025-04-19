import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVenuesTable1744644465946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建场所表
    await queryRunner.query(`
      CREATE TABLE venues (
          id BIGSERIAL PRIMARY KEY,
          venue_id BIGINT NOT NULL,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(255) NOT NULL,
          contact_phone VARCHAR(20) NOT NULL,
          business_hours VARCHAR(100),
          facilities TEXT,
          images TEXT,
          status SMALLINT NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );

      COMMENT ON COLUMN venues.id IS '场地ID';
      COMMENT ON COLUMN venues.venue_id IS '业务场地ID';
      COMMENT ON COLUMN venues.name IS '场地名称';
      COMMENT ON COLUMN venues.address IS '场地地址';
      COMMENT ON COLUMN venues.contact_phone IS '联系电话';
      COMMENT ON COLUMN venues.business_hours IS '营业时间';
      COMMENT ON COLUMN venues.facilities IS '场地设施描述';
      COMMENT ON COLUMN venues.images IS '场地图片，JSON数组';
      COMMENT ON COLUMN venues.status IS '状态：0-禁用，1-正常';
      COMMENT ON COLUMN venues.created_at IS '创建时间';
      COMMENT ON COLUMN venues.updated_at IS '更新时间';
      COMMENT ON COLUMN venues.deleted_at IS '删除时间';
      COMMENT ON TABLE venues IS '场所表，存储系统中的各种场地信息';

      CREATE TRIGGER update_venues_updated_at
      BEFORE UPDATE ON venues
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS venues CASCADE;`);
  }
}
