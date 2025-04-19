import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/token/jwt-auth.guard';
import { RoleGuard, Roles } from '../../core/token/role.guard';

@ApiTags('teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin', 'manager')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: '创建新团队' })
  @ApiResponse({ status: 201, description: '团队创建成功' })
  @ApiResponse({ status: 400, description: '无效的请求数据' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有团队' })
  @ApiResponse({ status: 200, description: '返回所有团队列表' })
  async findAll() {
    return await this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取团队' })
  @ApiResponse({ status: 200, description: '返回指定团队' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async findOne(@Param('id') id: string) {
    return await this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新团队信息' })
  @ApiResponse({ status: 200, description: '团队更新成功' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: Partial<CreateTeamDto>,
  ) {
    return await this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除团队' })
  @ApiResponse({ status: 200, description: '团队删除成功' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async remove(@Param('id') id: string) {
    return await this.teamsService.remove(id);
  }
}
