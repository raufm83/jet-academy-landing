import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Yalnız idarə paneli üçün — public GET yoxdur (saytda FAQ göstərilmir).
 * Public GET üçün FaqPublicController istifadə olunur.
 */
@ApiTags('FAQ (Admin)')
@Controller('faq')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.CONTENTMANAGER)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni FAQ elementi' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateFaqItemDto) {
    return this.faqService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'FAQ siyahısı (səhifələnmiş)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'pageKey',
    required: false,
    description: 'Yalnız bu səhifə key-inə olan FAQ-lar',
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('pageKey') pageKey?: string,
  ) {
    return this.faqService.findAll(+page, +limit, pageKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tək FAQ elementi' })
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'FAQ yenilə' })
  update(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'FAQ sil' })
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
