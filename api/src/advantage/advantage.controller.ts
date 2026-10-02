import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdvantageService } from './advantage.service';
import { CreateAdvantageDto } from './dto/create-advantage.dto';
import { UpdateAdvantageDto } from './dto/update-advantage.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('advantage')
export class AdvantageController {
  constructor(private readonly advantageService: AdvantageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  create(@Body() createAdvantageDto: CreateAdvantageDto) {
    return this.advantageService.create(createAdvantageDto);
  }

  @Get()
  findAll() {
    return this.advantageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advantageService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  update(@Param('id') id: string, @Body() updateAdvantageDto: UpdateAdvantageDto) {
    return this.advantageService.update(id, updateAdvantageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  remove(@Param('id') id: string) {
    return this.advantageService.remove(id);
  }
}
