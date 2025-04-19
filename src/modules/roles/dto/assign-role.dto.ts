import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserRoleDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsInt({ message: '用户ID必须是整数' })
  userId: number;

  @ApiProperty({ description: '角色ID数组', example: [1, 2] })
  @IsArray({ message: '角色ID列表必须是数组' })
  @ArrayMinSize(1, { message: '至少需要分配一个角色' })
  @IsInt({ each: true, message: '角色ID必须是整数' })
  roleIds: number[];
}

export class BatchAssignRoleDto {
  @ApiProperty({ description: '用户角色分配数据', type: [UserRoleDto] })
  @IsArray({ message: '用户角色数据必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  @ArrayMinSize(1, { message: '至少需要一条分配数据' })
  assignments: UserRoleDto[];
}
