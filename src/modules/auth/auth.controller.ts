import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';

@ApiTags('鉴权(auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({
    status: 400,
    description: '注册失败，验证码无效或手机号已注册',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回token' })
  @ApiResponse({ status: 400, description: '登录失败，验证码无效' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('send-code/:phone')
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  async sendSmsCode(@Param('phone') phone: string) {
    return this.authService.sendSmsCode(phone);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户个人资料' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  getProfile(@Body('user') user: any) {
    return user;
  }
}
