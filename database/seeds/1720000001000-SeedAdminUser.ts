import { MigrationInterface, QueryRunner } from 'typeorm';
import * as crypto from 'crypto';

export class SeedAdminUser1720000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 生成随机盐值
    const salt = crypto.randomBytes(16).toString('hex');

    // 使用盐值加密密码 (默认密码: admin123)
    const password = 'admin123';
    const hashedPassword = crypto
      .createHmac('sha256', salt)
      .update(password)
      .digest('hex');

    // 插入默认管理员账号
    await queryRunner.query(`
      INSERT INTO managers (username, password, salt, nick_name, real_name, email, status) 
      VALUES ('admin', '${hashedPassword}', '${salt}', '系统管理员', '管理员', 'admin@sportshub.com', 1);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除默认管理员账号
    await queryRunner.query(`DELETE FROM managers WHERE username = 'admin';`);
  }
}
