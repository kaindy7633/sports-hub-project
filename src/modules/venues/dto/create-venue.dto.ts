import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ description: '场地名称', example: '奥林匹克体育馆' })
  @IsNotEmpty({ message: '场地名称不能为空' })
  @IsString({ message: '场地名称必须是字符串' })
  @MaxLength(100, { message: '场地名称不能超过100个字符' })
  name: string;

  @ApiProperty({ description: '场地地址', example: '北京市朝阳区奥林匹克公园' })
  @IsNotEmpty({ message: '场地地址不能为空' })
  @IsString({ message: '场地地址必须是字符串' })
  @MaxLength(255, { message: '场地地址不能超过255个字符' })
  address: string;

  @ApiProperty({ description: '联系电话', example: '010-12345678' })
  @IsNotEmpty({ message: '联系电话不能为空' })
  @IsString({ message: '联系电话必须是字符串' })
  @MaxLength(20, { message: '联系电话不能超过20个字符' })
  contact_phone: string;

  @ApiProperty({
    description: '营业时间',
    example: '周一至周日 09:00-22:00',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '营业时间必须是字符串' })
  @MaxLength(100, { message: '营业时间不能超过100个字符' })
  business_hours?: string;

  @ApiProperty({
    description: '场地设施描述',
    example: '标准篮球场4个，羽毛球场6个，游泳池1个',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '场地设施描述必须是字符串' })
  facilities?: string;

  @ApiProperty({
    description: '场地图片，JSON数组',
    example: '["image1.jpg", "image2.jpg"]',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '场地图片必须是JSON字符串' })
  images?: string;

  @ApiProperty({ description: '状态：0-禁用，1-正常', example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态不能小于0' })
  @Max(1, { message: '状态不能大于1' })
  status?: number = 1;
}
