import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BigIntTransformer } from '../../../common/transformers/bigint.transformer';

@Entity('messages')
export class Message {
  @ApiProperty({ description: '消息ID', example: '1' })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @ApiProperty({ description: '业务消息ID', example: '100001' })
  @Column({
    type: 'bigint',
    transformer: new BigIntTransformer(),
  })
  message_id: string;

  @ApiProperty({ description: '发送者ID', example: '1' })
  @Column({ type: 'bigint' })
  sender_id: bigint;

  @ApiProperty({ description: '接收者ID', example: '2' })
  @Column({ type: 'bigint' })
  receiver_id: bigint;

  @ApiProperty({ 
    description: '消息类型：1-系统消息，2-活动消息，3-团队消息', 
    example: 1 
  })
  @Column({ type: 'smallint', default: 1 })
  type: number;

  @ApiProperty({ description: '消息标题', example: '活动通知' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '消息内容', example: '您的活动申请已通过审核' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ 
    description: '读取状态：0-未读，1-已读', 
    example: 0 
  })
  @Column({ type: 'smallint', default: 0 })
  read_status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
