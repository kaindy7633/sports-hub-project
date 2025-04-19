import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagerIdToManagers1744644465942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加manager_id字段到managers表
    await queryRunner.query(`
      ALTER TABLE managers 
      ADD COLUMN manager_id BIGINT NOT NULL DEFAULT 0;
      
      COMMENT ON COLUMN managers.manager_id IS '管理员唯一标识符，类似于users表中的user_id';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚操作：删除manager_id字段
    await queryRunner.query(`
      ALTER TABLE managers 
      DROP COLUMN manager_id;
    `);
  }
}
