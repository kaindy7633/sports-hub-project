import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateManagersTable1744644465941 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查managers表是否已存在
    const tableExists = await queryRunner.hasTable('managers');
    if (!tableExists) {
      // 创建系统管理员表
      await queryRunner.query(`
          CREATE TABLE managers (
              id BIGSERIAL PRIMARY KEY,
              username VARCHAR(50) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              salt VARCHAR(32) NOT NULL,
              parent_id BIGINT NOT NULL DEFAULT 0,
              nick_name VARCHAR(50),
              real_name VARCHAR(50),
              avatar VARCHAR(255),
              email VARCHAR(100),
              phone VARCHAR(20),
              status SMALLINT NOT NULL DEFAULT 1,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              deleted_at TIMESTAMP
          );

          COMMENT ON COLUMN managers.id IS '管理员ID';
          COMMENT ON COLUMN managers.username IS '用户名';
          COMMENT ON COLUMN managers.password IS '密码（加密存储）';
          COMMENT ON COLUMN managers.salt IS '密码加密盐值';
          COMMENT ON COLUMN managers.parent_id IS '父管理员ID，0表示超级管理员';
          COMMENT ON COLUMN managers.nick_name IS '昵称';
          COMMENT ON COLUMN managers.real_name IS '真实姓名';
          COMMENT ON COLUMN managers.avatar IS '头像URL';
          COMMENT ON COLUMN managers.email IS '电子邮箱';
          COMMENT ON COLUMN managers.phone IS '手机号码';
          COMMENT ON COLUMN managers.status IS '状态：0-禁用，1-正常';
          COMMENT ON COLUMN managers.created_at IS '创建时间';
          COMMENT ON COLUMN managers.updated_at IS '更新时间';
          COMMENT ON COLUMN managers.deleted_at IS '删除时间';
          COMMENT ON TABLE managers IS '系统管理员表，存储系统管理员信息，区别于普通用户';
        `);

      // 创建更新时间触发器
      await queryRunner.query(`
            CREATE TRIGGER update_managers_updated_at
            BEFORE UPDATE ON managers
            FOR EACH ROW
            EXECUTE FUNCTION update_modified_column();
          `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除触发器
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_managers_updated_at ON managers;`,
    );

    // 删除表
    await queryRunner.query(`DROP TABLE IF EXISTS managers;`);
  }
}
