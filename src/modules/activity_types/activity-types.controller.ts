import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { QueryActivityTypeDto } from './dto/query-activity-type.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';
import { PAGINATION } from '../../common/constants';

@ApiTags('活动类型(activity-types)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建活动类型' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '活动类型创建成功',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  create(@Body() createActivityTypeDto: CreateActivityTypeDto) {
    return this.activityTypesService.create(createActivityTypeDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '分页查询活动类型列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动类型列表',
  })
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
  findAll(@Query() query: QueryActivityTypeDto) {
    // 确保使用默认值
    const pageNum = query.pageNum || PAGINATION.DEFAULT_PAGE_NUM;
    const pageSize = query.pageSize || PAGINATION.DEFAULT_PAGE_SIZE;

    return this.activityTypesService.findAll({
      ...query,
      pageNum,
      pageSize,
    });
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有活动类型（不分页）' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回所有活动类型列表',
  })
  findAllList() {
    return this.activityTypesService.findAllList();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取活动类型详情' })
  @ApiParam({ name: 'id', description: '活动类型ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回活动类型详情',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动类型不存在' })
  findOne(@Param('id') id: string) {
    return this.activityTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新活动类型信息' })
  @ApiParam({ name: 'id', description: '活动类型ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '活动类型更新成功',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动类型不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  update(
    @Param('id') id: string,
    @Body() updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    return this.activityTypesService.update(id, updateActivityTypeDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除活动类型' })
  @ApiParam({ name: 'id', description: '活动类型ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '活动类型删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '活动类型不存在' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '活动类型已被使用，无法删除',
  })
  remove(@Param('id') id: string) {
    return this.activityTypesService.remove(id);
  }
}
