// src/modules/managers/admin-auth.controller.ts
import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { LoginManagerDto } from './dto/login-manager.dto';
import { TokenService } from '../../core/token/token.service';
import * as crypto from 'crypto';

@ApiTags('管理员鉴权(admin-auth)')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly managersService: ManagersService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: HttpStatus.OK, description: '登录成功，返回token' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '账号不存在' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '密码错误' })
  async login(@Body() loginManagerDto: LoginManagerDto) {
    const { username, password } = loginManagerDto;

    // 查找管理员
    const manager = await this.managersService.findByUsername(username);

    // 验证密码
    const hashedPassword = crypto
      .pbkdf2Sync(password, manager.salt, 1000, 64, 'sha512')
      .toString('hex');

    if (hashedPassword !== manager.password) {
      return {
        code: HttpStatus.UNAUTHORIZED,
        message: '密码错误',
      };
    }

    // 生成token - 使用业务ID（manager_id）而非内部ID
    const token = this.tokenService.generateToken({
      userId: manager.manager_id.toString(), // 使用业务ID
      username: manager.username,
      role: 'admin', // 设置角色为admin，用于角色守卫验证
    });

    // 返回管理员信息（排除敏感字段）
    const { password: _, salt: __, ...managerInfo } = manager;

    return {
      code: HttpStatus.OK,
      message: '登录成功',
      data: {
        token,
        manager: managerInfo,
      },
    };
  }
}
