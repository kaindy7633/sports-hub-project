import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常基类
 * 用于封装所有业务相关的异常，支持自定义错误码和错误原因
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    public readonly code: number = 10001,
    cause?: Error,
  ) {
    const response = {
      code,
      msg: message,
      data: null,
    };

    super(response, HttpStatus.BAD_REQUEST, { cause });
  }
}
