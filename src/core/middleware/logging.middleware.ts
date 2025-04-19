import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.config';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 生成唯一请求ID
    const requestId = uuidv4();
    req['requestId'] = requestId;

    // 记录请求开始
    const startTime = Date.now();
    const { method, originalUrl, ip, body, query } = req;

    logger.info({
      message: 'Request received',
      requestId,
      method,
      url: originalUrl,
      ip,
      query,
      body: this.sanitizeBody(body),
    });

    // 监听响应完成事件
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // 确定日志级别
      let level = 'info';
      if (statusCode >= 400 && statusCode < 500) {
        level = 'warn';
      } else if (statusCode >= 500) {
        level = 'error';
      }

      // 记录响应日志
      logger.log(level, {
        message: 'Request completed',
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }

  // 清理敏感数据
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'credential'];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }
}

// 函数式中间件，可作为替代方案
export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = uuidv4();
  req['requestId'] = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    logger.info({
      message: 'Request completed',
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${Date.now() - startTime}ms`,
    });
  });

  next();
}
