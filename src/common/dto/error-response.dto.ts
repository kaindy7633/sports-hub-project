import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一错误响应数据传输对象
 * 用于所有异常过滤器返回的响应格式
 */
export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP 状态码' })
  statusCode: number;

  @ApiProperty({ description: '错误信息' })
  message: string;

  @ApiProperty({ description: '错误码（业务自定义）', required: false })
  code?: number;

  @ApiProperty({ description: '请求路径' })
  path: string;

  @ApiProperty({ description: '时间戳' })
  timestamp: string;

  @ApiProperty({ description: '错误详情', required: false })
  details?: any;
}
