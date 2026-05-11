import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyService } from './vacancy.service';

@ApiTags('Vacancies')
@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Get()
  @ApiOperation({ summary: 'Aktiv vakansiyalar (sayt)' })
  @ApiResponse({ status: 200 })
  findAllPublic() {
    return this.vacancyService.findAllPublic();
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Tək vakansiya slug ilə (sayt, aktiv)' })
  findBySlugPublic(@Param('slug') slug: string) {
    return this.vacancyService.findBySlugPublic(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER, Role.HRMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yeni vakansiya (admin)' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateVacancyDto) {
    return this.vacancyService.create(dto);
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER, Role.HRMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bütün vakansiyalar (admin, səhifələnmiş)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllManage(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.vacancyService.findAllManage(+page, +limit);
  }

  @Get('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER, Role.HRMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tək vakansiya id ilə (admin)' })
  findOne(@Param('id') id: string) {
    return this.vacancyService.findOne(id);
  }

  @Patch('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER, Role.HRMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiya yenilə (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateVacancyDto) {
    return this.vacancyService.update(id, dto);
  }

  @Delete('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER, Role.HRMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Vakansiya sil (admin)' })
  remove(@Param('id') id: string) {
    return this.vacancyService.remove(id);
  }
}
