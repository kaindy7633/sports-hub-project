import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @ApiProperty({ description: '接收者ID', example: '1' })
  @IsNotEmpty({ message: '接收者ID不能为空' })
  @IsString({ message: '接收者ID必须是字符串' })
  receiver_id: string;

  @ApiProperty({ 
    description: '消息类型：1-系统消息，2-活动消息，3-团队消息', 
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '消息类型必须是整数' })
  @Min(1, { message: '消息类型不能小于1' })
  @Max(3, { message: '消息类型不能大于3' })
  type?: number = 1;

  @ApiProperty({ description: '消息标题', example: '活动通知' })
  @IsNotEmpty({ message: '消息标题不能为空' })
  @IsString({ message: '消息标题必须是字符串' })
  @MaxLength(100, { message: '消息标题不能超过100个字符' })
  title: string;

  @ApiProperty({ description: '消息内容', example: '您的活动申请已通过审核' })
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  content: string;
}
