// src/modules/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../../core/token/token.service';
import { CacheService } from '../../core/cache/cache.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { SnowflakeService } from '../../core/snowflake/snowflake.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private cacheService: CacheService,
    private snowflakeService: SnowflakeService,
  ) {}

  /**
   * 发送短信验证码
   * @param phone 手机号
   * @returns 发送结果
   */
  async sendSmsCode(phone: string): Promise<{ message: string }> {
    // 生成6位随机验证码（确保0开头的情况也能正确处理）
    let verificationCode = Math.floor(Math.random() * 1000000).toString();
    // 补齐前导零
    verificationCode = verificationCode.padStart(6, '0');

    // 存储验证码到Redis，有效期60秒
    await this.cacheService.setVerificationCode(phone, verificationCode, 60);

    // TODO 实际应用中，这里应该调用短信服务发送验证码
    this.logger.log(`向手机号 ${phone} 发送验证码: ${verificationCode}`);

    return { message: '验证码已发送' };
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   * @returns 验证结果
   */
  private async verifyCode(phone: string, code: string): Promise<boolean> {
    try {
      const storedCode = await this.cacheService.getVerificationCode(phone);

      if (!storedCode) {
        this.logger.warn(`验证码不存在或已过期: ${phone}`);
        return false;
      }

      const isValid = storedCode === code;
      this.logger.debug(
        `验证码验证${isValid ? '成功' : '失败'}: ${phone}, 输入=${code}, 存储=${storedCode}`,
      );
      return isValid;
    } catch (error) {
      this.logger.error(`验证码验证过程出错: ${error.message}`);
      return false;
    }
  }

  /**
   * 用户注册
   * @param registerDto 注册信息
   * @returns 注册结果
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { phone, verificationCode, password } = registerDto;

    // 验证验证码
    if (!(await this.verifyCode(phone, verificationCode))) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    // 创建用户
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    // 生成用户名（使用手机号作为默认用户名）
    const username = `user_${phone}`;

    // 创建用户
    const user = await this.usersService.create({
      username,
      password,
      phone,
      nick_name: username,
    });

    // 创建用户认证信息
    await this.usersService.createUserAuth({
      user_id: user.id,
      identity_type: 'phone',
      identifier: phone,
      credential: hashedPassword,
    });

    // 清除验证码
    await this.cacheService.delVerificationCode(phone);

    return { message: '注册成功' };
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @returns 登录结果，包含token
   */
  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { phone, verificationCode } = loginDto;

    // 验证验证码
    if (!(await this.verifyCode(phone, verificationCode))) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 查找用户
    let user = await this.usersService.findByPhone(phone);

    // 如果用户不存在，则自动注册
    if (!user) {
      // 生成用户名（使用手机号作为默认用户名）
      const username = `user_${phone}`;

      // 生成随机密码（实际应用中可能需要更复杂的逻辑）
      const password = Math.random().toString(36).slice(-8);
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');

      // 创建用户
      user = await this.usersService.create({
        username,
        password,
        phone,
        nick_name: username,
      });

      // 创建用户认证信息
      await this.usersService.createUserAuth({
        user_id: user.id,
        identity_type: 'phone',
        identifier: phone,
        credential: hashedPassword,
      });
    }

    // 生成token - 使用业务ID
    const token = this.tokenService.generateToken({
      userId: user.user_id.toString(), // 使用业务ID
      username: user.username,
      phone: user.phone,
    });

    // 清除验证码
    await this.cacheService.delVerificationCode(phone);

    // 返回用户信息（排除敏感字段）
    const { password, salt, ...userInfo } = user;

    return {
      token,
      user: userInfo,
    };
  }
}
