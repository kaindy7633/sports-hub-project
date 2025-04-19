import * as winston from 'winston';
import { join } from 'path';

/**
 * 日志配置工厂函数，根据不同环境创建不同配置的日志记录器
 * @param env 环境名称
 */
export function createLoggerConfig(
  env = process.env.NODE_ENV || 'development',
) {
  // 确保日志目录存在
  const logDir = join(process.cwd(), 'logs');

  // 创建日志格式
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  );

  // 控制台输出格式
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level}: ${typeof message === 'object' ? JSON.stringify(message) : message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    }),
  );

  // 基础传输配置
  const transports: winston.transport[] = [
    new winston.transports.Console({ format: consoleFormat }),
  ];

  // 非生产环境时输出到文件
  if (env !== 'test') {
    transports.push(
      new winston.transports.File({
        filename: join(logDir, 'error.log'),
        level: 'error',
        format: logFormat,
      }),
      new winston.transports.File({
        filename: join(logDir, 'combined.log'),
        format: logFormat,
      }),
    );
  }

  // 创建并返回日志记录器
  return winston.createLogger({
    level: env === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports,
    exitOnError: false,
  });
}

// 导出默认日志记录器实例
export const logger = createLoggerConfig();
