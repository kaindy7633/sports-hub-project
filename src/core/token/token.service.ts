// src/core/token/token.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string; // 业务ID而非数据库自增ID
  username: string;
  [key: string]: any;
}

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpirationTime: string | number;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    this.jwtSecret = secret;
    // 可以接受字符串或数字类型的过期时间
    this.jwtExpirationTime =
      this.configService.get<string | number>('jwt.expirationTime') ?? '24h';
  }

  /**
   * 生成JWT令牌
   * @param payload 令牌载荷
   * @returns 生成的JWT令牌
   */
  generateToken(payload: TokenPayload): string {
    return (jwt as any).sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpirationTime,
    });
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 验证结果，包含令牌载荷
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 刷新JWT令牌
   * @param oldToken 旧令牌
   * @returns 新生成的JWT令牌
   */
  refreshToken(oldToken: string): string {
    const decoded = this.verifyToken(oldToken);
    // 移除过期时间相关字段
    const { exp, iat, ...payload } = decoded as any;
    // 生成新令牌
    return this.generateToken(payload as TokenPayload);
  }
}
