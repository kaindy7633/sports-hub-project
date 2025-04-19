import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'johndoe' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MaxLength(50, { message: '用户名不能超过50个字符' })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;

  @ApiProperty({ description: '用户昵称', example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称不能超过50个字符' })
  nick_name?: string;

  @ApiProperty({
    description: '真实姓名',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '真实姓名不能超过50个字符' })
  real_name?: string;

  @ApiProperty({
    description: '身份证号',
    example: '110101199001011234',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(18, { message: '身份证号码不能超过18个字符' })
  id_card?: string;

  @ApiProperty({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '电子邮箱',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱不能超过100个字符' })
  email?: string;

  @ApiProperty({
    description: '电话号码',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '手机号码不能超过20个字符' })
  phone?: string;

  @ApiProperty({
    description: '紧急联系人电话',
    example: '13900139000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '紧急联系人电话不能超过20个字符' })
  emergency_contact?: string;

  @ApiProperty({
    description: '地址',
    example: '北京市海淀区',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '地址不能超过255个字符' })
  address?: string;

  @ApiProperty({
    description: '性别',
    enum: Gender,
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: '性别值无效' })
  gender?: number;

  @ApiProperty({
    description: '出生日期',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '出生日期格式不正确' })
  birthday?: Date;
}
