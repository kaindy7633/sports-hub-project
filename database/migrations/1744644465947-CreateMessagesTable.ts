import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1744644465947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建消息表
    await queryRunner.query(`
      CREATE TABLE messages (
          id BIGSERIAL PRIMARY KEY,
          message_id BIGINT NOT NULL,
          sender_id BIGINT NOT NULL,
          receiver_id BIGINT NOT NULL,
          type SMALLINT NOT NULL DEFAULT 1,
          title VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          read_status SMALLINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP
      );

      COMMENT ON COLUMN messages.id IS '消息ID';
      COMMENT ON COLUMN messages.message_id IS '业务消息ID';
      COMMENT ON COLUMN messages.sender_id IS '发送者ID';
      COMMENT ON COLUMN messages.receiver_id IS '接收者ID';
      COMMENT ON COLUMN messages.type IS '消息类型：1-系统消息，2-活动消息，3-团队消息';
      COMMENT ON COLUMN messages.title IS '消息标题';
      COMMENT ON COLUMN messages.content IS '消息内容';
      COMMENT ON COLUMN messages.read_status IS '读取状态：0-未读，1-已读';
      COMMENT ON COLUMN messages.created_at IS '创建时间';
      COMMENT ON COLUMN messages.updated_at IS '更新时间';
      COMMENT ON COLUMN messages.deleted_at IS '删除时间';
      COMMENT ON TABLE messages IS '消息表，存储系统中的各种消息信息';

      CREATE TRIGGER update_messages_updated_at
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS messages CASCADE;`);
  }
}
