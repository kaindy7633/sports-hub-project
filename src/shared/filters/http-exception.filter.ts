import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 如果异常响应已经是标准格式(有code和msg)，直接使用
    if (
      typeof exceptionResponse === 'object' &&
      'code' in exceptionResponse &&
      'msg' in exceptionResponse
    ) {
      response.status(status).json(exceptionResponse);
      return;
    }

    // 否则提取消息并构造标准格式
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // 统一返回格式
    const errorResponse = {
      code: status,
      data: null,
      msg: message,
    };

    response.status(status).json(errorResponse);
  }
}
