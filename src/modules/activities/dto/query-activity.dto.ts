import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION } from '../../../common/constants';

export class QueryActivityDto {
  @ApiProperty({ description: '活动标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '活动类型ID', required: false })
  @IsOptional()
  @IsString()
  type_id?: string;

  @ApiProperty({ description: '场地ID', required: false })
  @IsOptional()
  @IsString()
  venue_id?: string;

  @ApiProperty({ description: '创建者ID', required: false })
  @IsOptional()
  @IsString()
  creator_id?: string;

  @ApiProperty({ description: '团队ID', required: false })
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiProperty({ description: '开始时间起点', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time_from?: Date;

  @ApiProperty({ description: '开始时间终点', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time_to?: Date;

  @ApiProperty({
    description: '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  status?: number;

  @ApiProperty({
    description: '页码',
    example: PAGINATION.DEFAULT_PAGE_NUM,
    default: PAGINATION.DEFAULT_PAGE_NUM,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码不能小于1' })
  pageNum?: number = PAGINATION.DEFAULT_PAGE_NUM;

  @ApiProperty({
    description: '每页条数',
    example: PAGINATION.DEFAULT_PAGE_SIZE,
    default: PAGINATION.DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须是整数' })
  @Min(1, { message: '每页条数不能小于1' })
  pageSize?: number = PAGINATION.DEFAULT_PAGE_SIZE;
}
