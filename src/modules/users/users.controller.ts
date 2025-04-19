// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin', 'manager')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiResponse({ status: 200, description: '返回分页用户列表' })
  @ApiQuery({ name: 'pageNum', description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', description: '每页条数', example: 10 })
  @ApiQuery({ name: 'username', description: '用户名', required: false })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  @ApiQuery({ name: 'email', description: '邮箱', required: false })
  async findAll(
    @Query('pageNum') pageNum: number,
    @Query('pageSize') pageSize: number,
    @Query('username') username?: string,
    @Query('phone') phone?: string,
    @Query('email') email?: string,
  ) {
    return await this.usersService.findAll({
      pageNum: +pageNum,
      pageSize: +pageSize,
      username,
      phone,
      email,
    });
  }

  @Get('list')
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiResponse({ status: 200, description: '返回所有用户列表' })
  @ApiQuery({ name: 'username', description: '用户名', required: false })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  @ApiQuery({ name: 'email', description: '邮箱', required: false })
  async findAllList(
    @Query('username') username?: string,
    @Query('phone') phone?: string,
    @Query('email') email?: string,
  ) {
    return await this.usersService.findAllList({ username, phone, email });
  }

  @Get(':userId')
  @ApiOperation({ summary: '根据业务ID获取用户' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiResponse({ status: 200, description: '返回指定用户' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('userId', ParseIntPipe) userId: string) {
    return await this.usersService.findOne(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(
    @Param('userId', ParseIntPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'userId', description: '业务用户ID' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('userId', ParseIntPipe) userId: string) {
    return await this.usersService.remove(userId);
  }

  @Post('auth')
  @ApiOperation({ summary: '添加用户认证信息' })
  @ApiResponse({ status: 201, description: '认证信息添加成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  async addAuth(
    @Body()
    authData: {
      userId: string;
      identityType: string;
      identifier: string;
      credential: string;
    },
  ) {
    return await this.usersService.addUserAuth(authData);
  }
}
