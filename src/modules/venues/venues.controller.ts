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
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('venues')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建场地' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '场地创建成功',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  create(@Body() createVenueDto: CreateVenueDto) {
    return this.venuesService.create(createVenueDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询场地列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回场地列表',
  })
  findAll(@Query() query: QueryVenueDto) {
    return this.venuesService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有场地（不分页）' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回所有场地列表',
  })
  findAllList() {
    return this.venuesService.findAllList();
  }

  @Get(':venueId')
  @ApiOperation({ summary: '根据业务ID获取场地详情' })
  @ApiParam({ name: 'venueId', description: '业务场地ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '返回场地详情',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '场地不存在' })
  findOne(@Param('venueId') venueId: string) {
    return this.venuesService.findOne(venueId);
  }

  @Patch(':venueId')
  @Roles('admin')
  @ApiOperation({ summary: '更新场地信息' })
  @ApiParam({ name: 'venueId', description: '业务场地ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '场地更新成功',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '场地不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '请求参数无效' })
  update(
    @Param('venueId') venueId: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    return this.venuesService.update(venueId, updateVenueDto);
  }

  @Delete(':venueId')
  @Roles('admin')
  @ApiOperation({ summary: '删除场地' })
  @ApiParam({ name: 'venueId', description: '业务场地ID' })
  @ApiResponse({ status: HttpStatus.OK, description: '场地删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '场地不存在' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '场地已被活动引用，无法删除',
  })
  remove(@Param('venueId') venueId: string) {
    return this.venuesService.remove(venueId);
  }
}
