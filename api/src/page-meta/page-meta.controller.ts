import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
import { PageMetaService } from './page-meta.service';
import { UpsertPageMetaDto } from './dto/upsert-page-meta.dto';

@ApiTags('Page Meta (SEO)')
@Controller('page-meta')
export class PageMetaController {
  constructor(private readonly pageMetaService: PageMetaService) {}

  @Get()
  @ApiOperation({
    summary: 'Get page meta by key and locale (public) or list all',
  })
  @ApiQuery({
    name: 'pageKey',
    required: false,
    description: 'Page identifier',
  })
  @ApiQuery({
    name: 'locale',
    required: false,
    description: 'Locale (az | en)',
  })
  @ApiResponse({ status: 200, description: 'Page meta or list' })
  async find(
    @Query('pageKey') pageKey?: string,
    @Query('locale') locale?: string,
  ) {
    if (pageKey && locale) {
      const meta = await this.pageMetaService.findByKeyAndLocale(
        pageKey,
        locale,
      );
      return meta;
    }
    return this.pageMetaService.findAll(pageKey);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update page meta (SEO)' })
  @ApiResponse({ status: 200, description: 'Page meta saved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upsertPut(@Body() dto: UpsertPageMetaDto) {
    return this.upsert(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update page meta (SEO)' })
  @ApiResponse({ status: 200, description: 'Page meta saved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upsertPost(@Body() dto: UpsertPageMetaDto) {
    return this.upsert(dto);
  }

  private async upsert(dto: UpsertPageMetaDto) {
    return this.pageMetaService.upsert(dto.pageKey, dto.locale, {
      title: dto.title,
      description: dto.description,
    });
  }
}
