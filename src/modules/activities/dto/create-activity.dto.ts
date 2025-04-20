import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsDate,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ACTIVITY_STATUS } from '../../../common/constants';

export class CreateActivityDto {
  @ApiProperty({ description: '活动标题', example: '周末篮球赛' })
  @IsNotEmpty({ message: '活动标题不能为空' })
  @IsString({ message: '活动标题必须是字符串' })
  @MaxLength(100, { message: '活动标题不能超过100个字符' })
  title: string;

  @ApiProperty({ description: '活动类型ID', example: '1' })
  @IsNotEmpty({ message: '活动类型ID不能为空' })
  @IsString({ message: '活动类型ID必须是字符串' })
  type_id: string;

  @ApiProperty({ description: '场地ID', example: '1' })
  @IsNotEmpty({ message: '场地ID不能为空' })
  @IsString({ message: '场地ID必须是字符串' })
  venue_id: string;

  @ApiProperty({ description: '团队ID', example: '1', required: false })
  @IsOptional()
  @IsString({ message: '团队ID必须是字符串' })
  team_id?: string;

  @ApiProperty({
    description: '活动描述',
    example: '这是一场精彩的篮球比赛，欢迎参加！',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '活动描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '开始时间', example: '2023-08-01T14:00:00' })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @Type(() => Date)
  @IsDate({ message: '开始时间格式不正确' })
  start_time: Date;

  @ApiProperty({ description: '结束时间', example: '2023-08-01T16:00:00' })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @Type(() => Date)
  @IsDate({ message: '结束时间格式不正确' })
  end_time: Date;

  @ApiProperty({
    description: '最大参与人数，0表示不限制',
    example: 20,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '最大参与人数必须是整数' })
  @Min(0, { message: '最大参与人数不能小于0' })
  max_participants?: number = 0;

  @ApiProperty({ description: '参与费用', example: 50.0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '参与费用最多保留两位小数' })
  @Min(0, { message: '参与费用不能小于0' })
  fee?: number = 0;

  @ApiProperty({
    description: '状态：0-草稿，1-已发布，2-未开始，3-进行中，4-已结束',
    example: ACTIVITY_STATUS.DRAFT,
    default: ACTIVITY_STATUS.DRAFT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态不能小于0' })
  @Max(4, { message: '状态不能大于4' })
  status?: number = ACTIVITY_STATUS.DRAFT;
}
