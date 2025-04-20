// src/modules/teams/dto/user-team-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserTeamResponseDto {
  @ApiProperty({ description: '团队业务ID', example: '100001' })
  team_id: string;

  @ApiProperty({ description: '团队名称', example: '篮球俱乐部' })
  name: string;

  @ApiProperty({
    description: '团队logo',
    example: 'https://example.com/logo.png',
    required: false,
  })
  logo?: string;

  @ApiProperty({
    description: '团队描述',
    example: '这是一个篮球爱好者的团队',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: '团队当前成员数', example: 10 })
  current_members: number;

  @ApiProperty({ description: '用户在团队中的角色', example: 'member' })
  role: string;

  @ApiProperty({
    description: '用户加入团队的时间',
    example: '2023-08-01T12:00:00Z',
  })
  joined_at: Date;

  @ApiProperty({ description: '团队状态：0-解散，1-正常', example: 1 })
  status: number;
}

export class UserTeamListResponseDto {
  @ApiProperty({
    description: '用户加入的团队列表',
    type: [UserTeamResponseDto],
  })
  list: UserTeamResponseDto[];

  @ApiProperty({ description: '总记录数', example: 5 })
  total: number;
}
