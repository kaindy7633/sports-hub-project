// src/modules/teams/dto/team-member-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberResponseDto {
  @ApiProperty({ description: '用户业务ID', example: '100001' })
  user_id: string;

  @ApiProperty({ description: '用户名', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: '用户昵称', example: 'John', required: false })
  nick_name?: string;

  @ApiProperty({
    description: '用户真实姓名',
    example: 'John Doe',
    required: false,
  })
  real_name?: string;

  @ApiProperty({
    description: '用户头像',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({ description: '用户在团队中的角色', example: 'member' })
  role: string;

  @ApiProperty({
    description: '用户加入团队的时间',
    example: '2023-08-01T12:00:00Z',
  })
  joined_at: Date;
}

export class TeamMemberListResponseDto {
  @ApiProperty({ description: '团队成员列表', type: [TeamMemberResponseDto] })
  list: TeamMemberResponseDto[];

  @ApiProperty({ description: '总记录数', example: 10 })
  total: number;
}
