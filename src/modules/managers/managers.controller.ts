// src/modules/managers/managers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { Manager } from './entities/manager.entity';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('managers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post()
  @ApiOperation({ summary: '创建管理员' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '创建成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '账号已存在' })
  async create(@Body() createManagerDto: CreateManagerDto): Promise<Manager> {
    return this.managersService.create(createManagerDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有管理员' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: [Manager],
  })
  async findAll(): Promise<Manager[]> {
    return this.managersService.findAll();
  }

  @Get(':managerId')
  @ApiOperation({ summary: '根据业务ID获取管理员' })
  @ApiParam({ name: 'managerId', description: '业务管理员ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async findOne(@Param('managerId') managerId: string): Promise<Manager> {
    console.log('managerId:', managerId);
    return this.managersService.findOne(managerId);
  }

  @Patch(':managerId')
  @ApiOperation({ summary: '更新管理员信息' })
  @ApiParam({ name: 'managerId', description: '业务管理员ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: Manager,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async update(
    @Param('managerId') managerId: string,
    @Body() updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    return this.managersService.update(managerId, updateManagerDto);
  }

  @Delete(':managerId')
  @ApiOperation({ summary: '删除管理员' })
  @ApiParam({ name: 'managerId', description: '业务管理员ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '管理员不存在' })
  async remove(@Param('managerId') managerId: string): Promise<void> {
    return this.managersService.remove(managerId);
  }
}
