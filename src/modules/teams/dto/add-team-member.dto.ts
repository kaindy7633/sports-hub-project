// src/modules/teams/dto/add-team-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AddTeamMemberDto {
  @ApiProperty({
    description: '用户在团队中的角色',
    example: 'member',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '角色必须是字符串' })
  @MaxLength(50, { message: '角色不能超过50个字符' })
  role?: string;
}
