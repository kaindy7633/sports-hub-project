import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleIdToRoles1744644465943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加role_id字段到roles表
    await queryRunner.query(`
      ALTER TABLE roles 
      ADD COLUMN role_id BIGINT NOT NULL UNIQUE;
      
      COMMENT ON COLUMN roles.role_id IS '业务角色ID';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚操作：删除role_id字段
    await queryRunner.query(`
      ALTER TABLE roles 
      DROP COLUMN role_id;
    `);
  }
}
