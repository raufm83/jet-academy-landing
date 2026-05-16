import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BlogCategoryService } from './blog-category.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@ApiTags('Blog categories')
@Controller('blog-categories')
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List blog categories (public)' })
  findAll() {
    return this.blogCategoryService.findAllOrdered();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one blog category' })
  findOne(@Param('id') id: string) {
    return this.blogCategoryService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Create blog category' })
  create(@Body() dto: CreateBlogCategoryDto) {
    return this.blogCategoryService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Update blog category' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.blogCategoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Delete blog category (posts lose category)' })
  remove(@Param('id') id: string) {
    return this.blogCategoryService.remove(id);
  }
}
