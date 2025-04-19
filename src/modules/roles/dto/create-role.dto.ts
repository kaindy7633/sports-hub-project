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

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  @IsString({ message: '角色名称必须是字符串' })
  @MaxLength(50, { message: '角色名称不能超过50个字符' })
  name: string;

  @ApiProperty({ description: '角色编码', example: 'admin' })
  @IsNotEmpty({ message: '角色编码不能为空' })
  @IsString({ message: '角色编码必须是字符串' })
  @MaxLength(50, { message: '角色编码不能超过50个字符' })
  code: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员，拥有所有权限',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(255, { message: '角色描述不能超过255个字符' })
  description?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态不能小于0' })
  @Max(1, { message: '状态不能大于1' })
  status?: number = 1;
}
