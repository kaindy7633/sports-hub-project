import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginManagerDto {
  @ApiProperty({ description: '管理员账号', example: 'admin' })
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString({ message: '账号必须是字符串' })
  @Length(4, 50, { message: '账号长度必须在4-50个字符之间' })
  username: string;

  @ApiProperty({ description: '管理员密码', example: 'password123' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度必须在6-20个字符之间' })
  password: string;
}
