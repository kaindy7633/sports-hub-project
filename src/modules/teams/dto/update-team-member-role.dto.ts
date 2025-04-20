// src/modules/teams/dto/update-team-member-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTeamMemberRoleDto {
  @ApiProperty({
    description: '用户在团队中的新角色',
    example: 'admin',
  })
  @IsNotEmpty({ message: '角色不能为空' })
  @IsString({ message: '角色必须是字符串' })
  @MaxLength(50, { message: '角色不能超过50个字符' })
  role: string;
}
