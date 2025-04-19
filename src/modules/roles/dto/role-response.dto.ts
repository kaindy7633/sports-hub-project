import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ description: '角色ID', example: '1' })
  id: string;

  @ApiProperty({ description: '角色名称', example: '管理员' })
  name: string;

  @ApiProperty({ description: '角色编码', example: 'admin' })
  code: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员，拥有所有权限',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1 })
  status: number;

  @ApiProperty({ description: '创建时间', example: '2023-06-01T12:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ description: '更新时间', example: '2023-06-01T12:00:00.000Z' })
  updated_at: Date;

  // 用户数量（可选，在查询角色详情时可能会返回）
  @ApiProperty({ description: '关联的用户数量', example: 5, required: false })
  userCount?: number;
}

export class PaginatedRoleResponseDto {
  @ApiProperty({ description: '角色列表', type: [RoleResponseDto] })
  list: RoleResponseDto[];

  @ApiProperty({ description: '总记录数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  pageNum: number;

  @ApiProperty({ description: '每页条数', example: 10 })
  pageSize: number;
}
