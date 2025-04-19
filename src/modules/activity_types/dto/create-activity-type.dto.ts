import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateActivityTypeDto {
  @ApiProperty({ description: '活动类型名称', example: '篮球' })
  @IsNotEmpty({ message: '活动类型名称不能为空' })
  @IsString({ message: '活动类型名称必须是字符串' })
  @MaxLength(50, { message: '活动类型名称不能超过50个字符' })
  name: string;

  @ApiProperty({ description: '活动类型编码', example: 'basketball' })
  @IsNotEmpty({ message: '活动类型编码不能为空' })
  @IsString({ message: '活动类型编码必须是字符串' })
  @MaxLength(50, { message: '活动类型编码不能超过50个字符' })
  code: string;

  @ApiProperty({
    description: '图标',
    example: 'basketball-icon.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '图标必须是字符串' })
  @MaxLength(255, { message: '图标不能超过255个字符' })
  icon?: string;

  @ApiProperty({
    description: '活动类型描述',
    example: '篮球相关活动',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '活动类型描述必须是字符串' })
  @MaxLength(255, { message: '活动类型描述不能超过255个字符' })
  description?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态不能小于0' })
  @Max(1, { message: '状态不能大于1' })
  status?: number = 1;
}
