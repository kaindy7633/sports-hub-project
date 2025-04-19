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

export class CreateCommentDto {
  @ApiProperty({ description: '活动ID', example: '1' })
  @IsNotEmpty({ message: '活动ID不能为空' })
  @IsString({ message: '活动ID必须是字符串' })
  activity_id: string;

  @ApiProperty({ description: '父评论ID', example: '0', required: false })
  @IsOptional()
  @IsString({ message: '父评论ID必须是字符串' })
  parent_id?: string;

  @ApiProperty({ description: '评论内容', example: '这是一个很棒的活动！' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '评论内容必须是字符串' })
  content: string;
}
