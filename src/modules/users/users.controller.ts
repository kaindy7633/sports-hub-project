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
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
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
import { PAGINATION } from '../../common/constants';

@ApiTags('用户(users)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin', 'manager')
// 在控制器类中添加 logger 实例
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

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
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    example: PAGINATION.DEFAULT_PAGE_NUM,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    example: PAGINATION.DEFAULT_PAGE_SIZE,
    required: false,
  })
  @ApiQuery({ name: 'username', description: '用户名', required: false })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  @ApiQuery({ name: 'email', description: '邮箱', required: false })
  async findAll(@Query() query: QueryUserDto) {
    // 过滤掉空字符串参数
    const filteredQuery: QueryUserDto = {};

    // 只保留有实际值的参数
    Object.keys(query).forEach((key) => {
      // 特殊处理 status 参数
      if (key === 'status') {
        // 只有当 status 参数明确存在于 URL 中且不为空字符串时才添加
        if (
          query.status !== undefined &&
          typeof query.status !== 'string' &&
          query.status !== null
        ) {
          // 将字符串转换为数字
          const statusValue = Number(query.status);
          // 只有当 status 是 1 时才添加（查询正常状态的用户）
          if (statusValue === 1) {
            filteredQuery.status = statusValue;
          }
          // 如果需要查询所有状态的用户，则不添加 status 条件
        }
      } else if (
        query[key] !== '' &&
        query[key] !== undefined &&
        query[key] !== null
      ) {
        filteredQuery[key] = query[key];
      }
    });

    this.logger.log(`过滤后的查询参数: ${JSON.stringify(filteredQuery)}`);

    return await this.usersService.findAll(filteredQuery);
  }

  @Get('list')
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiResponse({ status: 200, description: '返回所有用户列表' })
  @ApiQuery({ name: 'username', description: '用户名', required: false })
  @ApiQuery({ name: 'phone', description: '手机号', required: false })
  @ApiQuery({ name: 'email', description: '邮箱', required: false })
  async findAllList(@Query() query: Partial<QueryUserDto>) {
    // 过滤掉空字符串参数
    const filteredQuery: Partial<QueryUserDto> = {};

    // 只保留有实际值的参数
    if (query.username && query.username !== '')
      filteredQuery.username = query.username;
    if (query.phone && query.phone !== '') filteredQuery.phone = query.phone;
    if (query.email && query.email !== '') filteredQuery.email = query.email;

    this.logger.log(`过滤后的列表查询参数: ${JSON.stringify(filteredQuery)}`);

    return await this.usersService.findAllList(filteredQuery);
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

  // 在 UsersController 类中添加一个临时的端点
  @Get('debug/raw')
  @ApiOperation({ summary: '直接查询用户数据（调试用）' })
  async getRawUsers() {
    // 直接使用原生SQL查询
    const rawUsers = await this.usersService.userRepository.query(
      'SELECT * FROM users WHERE deleted_at IS NULL LIMIT 10',
    );
    return { count: rawUsers.length, data: rawUsers };
  }
}
