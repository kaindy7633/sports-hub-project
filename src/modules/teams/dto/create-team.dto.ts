import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: '团队名称', example: '上海足球俱乐部' })
  @IsNotEmpty({ message: '团队名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '团队名称不能超过100个字符' })
  name: string;

  @ApiProperty({
    description: '团队徽标URL',
    example: 'https://example.com/logo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    description: '团队描述',
    example: '专业足球俱乐部，成立于2000年',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
