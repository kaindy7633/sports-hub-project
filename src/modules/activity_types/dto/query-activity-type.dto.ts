import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryActivityTypeDto {
  @ApiProperty({ description: '活动类型名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '活动类型编码', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  status?: number;

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
