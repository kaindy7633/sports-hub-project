import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({ description: '状态：0-隐藏，1-显示', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态不能小于0' })
  @Max(1, { message: '状态不能大于1' })
  status?: number;
}
