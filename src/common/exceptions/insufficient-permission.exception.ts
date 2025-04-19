import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

/**
 * 权限不足异常
 * 当用户尝试执行没有权限的操作时抛出此异常
 */
export class InsufficientPermissionException extends BusinessException {
  constructor(resource: string, action: string, cause?: Error) {
    super(
      `无权${action}${resource}`,
      10005, // 权限错误码
      cause,
    );
  }
}
