import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

/**
 * 数据库操作异常
 * 用于封装所有与数据库操作相关的异常
 */
export class DatabaseException extends BusinessException {
  constructor(operation: string, entityName: string, cause?: Error) {
    super(
      `数据库${operation}${entityName}失败`,
      10004, // 数据操作异常错误码
      cause,
    );
  }
}
