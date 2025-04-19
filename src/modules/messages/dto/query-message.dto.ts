import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMessageDto {
  @ApiProperty({ description: '发送者ID', required: false })
  @IsOptional()
  @IsString()
  sender_id?: string;

  @ApiProperty({ description: '接收者ID', required: false })
  @IsOptional()
  @IsString()
  receiver_id?: string;

  @ApiProperty({
    description: '消息类型：1-系统消息，2-活动消息，3-团队消息',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  type?: number;

  @ApiProperty({
    description: '读取状态：0-未读，1-已读',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  read_status?: number;

  @ApiProperty({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  pageNum?: number = 1;

  @ApiProperty({ description: '每页条数', example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数不能小于1' })
  pageSize?: number = 10;
}
