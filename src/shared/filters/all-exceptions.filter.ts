import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as requestIp from 'request-ip';
import { logger } from '../../core/middleware/logger.config';

/**
 * 全局异常过滤器
 * 处理所有类型的异常并返回统一的响应格式
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取请求ID（如果存在）
    const requestId = request['requestId'] || 'unknown';

    // 确定状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 处理原始响应和错误信息
    const errorResponse: any =
      exception instanceof HttpException ? exception.getResponse() : {};

    // 如果异常响应已经是标准格式(有code和msg)，直接使用
    if (
      errorResponse &&
      typeof errorResponse === 'object' &&
      'code' in errorResponse &&
      'msg' in errorResponse
    ) {
      // 记录结构化日志
      logger.error({
        status,
        message: errorResponse.msg,
        code: errorResponse.code,
        requestId,
        ip: requestIp.getClientIp(request),
        method: request.method,
        url: request.url,
        query: request.query,
        body: request.body,
        stack: exception instanceof Error ? exception.stack : undefined,
      });

      response.status(status).json(errorResponse);
      return;
    }

    // 提取错误码(如果存在)
    const errorCode = errorResponse.code || status;

    // 提取错误消息
    const message = this.extractErrorMessage(exception, errorResponse);

    // 根据环境决定是否显示详细错误信息
    const isProduction = process.env.NODE_ENV === 'production';
    const productionMessage = status >= 500 ? '服务器内部错误' : message;

    // 记录结构化日志
    logger.error({
      status,
      message,
      errorCode,
      requestId,
      ip: requestIp.getClientIp(request),
      method: request.method,
      url: request.url,
      query: request.query,
      body: request.body,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // 构造统一响应格式
    const responseBody = {
      code: errorCode,
      data: null,
      msg: isProduction && status >= 500 ? productionMessage : message,
    };

    // 在开发环境下，可以添加额外的调试信息
    if (!isProduction && exception instanceof Error) {
      // 在日志中添加堆栈信息，不要在响应中返回
      logger.debug({
        requestId,
        stack: exception.stack,
      });
    }

    response.status(status).json(responseBody);
  }

  /**
   * 提取错误消息
   */
  private extractErrorMessage(exception: unknown, errorResponse: any): string {
    if (exception instanceof HttpException) {
      if (typeof errorResponse === 'string') {
        return errorResponse;
      }

      if (errorResponse.message) {
        return Array.isArray(errorResponse.message)
          ? errorResponse.message.join('; ')
          : errorResponse.message;
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return '未知错误';
  }
}
