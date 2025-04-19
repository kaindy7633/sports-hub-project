import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

/**
 * 资源未找到异常
 * 当请求的资源（例如球队、用户、赛事等）不存在时抛出此异常
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id: string | number, cause?: Error) {
    super(
      `${resource} 资源未找到：${id}`,
      10002, // 自定义错误码
      cause,
    );
  }
}
