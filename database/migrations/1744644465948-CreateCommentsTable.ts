import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommentsTable1744644465948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建评论表
    await queryRunner.query(`
      CREATE TABLE comments (
          id BIGSERIAL PRIMARY KEY,
          comment_id BIGINT NOT NULL,
          activity_id BIGINT NOT NULL,
          user_id BIGINT NOT NULL,
          parent_id BIGINT,
          content TEXT NOT NULL,
          likes INT NOT NULL DEFAULT 0,
          status SMALLINT NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );

      COMMENT ON COLUMN comments.id IS '评论ID';
      COMMENT ON COLUMN comments.comment_id IS '业务评论ID';
      COMMENT ON COLUMN comments.activity_id IS '活动ID';
      COMMENT ON COLUMN comments.user_id IS '评论用户ID';
      COMMENT ON COLUMN comments.parent_id IS '父评论ID，用于回复功能';
      COMMENT ON COLUMN comments.content IS '评论内容';
      COMMENT ON COLUMN comments.likes IS '点赞数';
      COMMENT ON COLUMN comments.status IS '状态：0-隐藏，1-显示';
      COMMENT ON COLUMN comments.created_at IS '创建时间';
      COMMENT ON COLUMN comments.updated_at IS '更新时间';
      COMMENT ON COLUMN comments.deleted_at IS '删除时间';
      COMMENT ON TABLE comments IS '评论表，存储用户对活动的评论信息';

      CREATE TRIGGER update_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS comments CASCADE;`);
  }
}
