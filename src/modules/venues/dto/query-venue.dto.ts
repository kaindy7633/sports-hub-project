import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION } from '../../../common/constants';

export class QueryVenueDto {
  @ApiProperty({ description: '场地名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '场地地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', required: false })
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
