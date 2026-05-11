import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { multerConfig } from 'src/multer/config';
import { GraduateService } from './graduate.service';

@ApiTags('Graduates')
@Controller('graduates')
export class GraduateController {
  constructor(private readonly graduateService: GraduateService) {}

  @Get()
  @ApiOperation({ summary: 'Aktiv məzunlar (sayt)' })
  @ApiResponse({ status: 200 })
  findAllPublic() {
    return this.graduateService.findAllPublic();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yeni məzun (admin)' })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() body: any,
    @UploadedFile(new SharpPipe('graduates', 800, 85, true))
    imageFilename?: string,
  ) {
    const dto = {
      name:
        body['name[az]'] || body['name[en]']
          ? { az: body['name[az]'] || '', en: body['name[en]'] || '' }
          : typeof body.name === 'string'
            ? JSON.parse(body.name)
            : body.name,
      story:
        body['story[az]'] || body['story[en]']
          ? { az: body['story[az]'] || '', en: body['story[en]'] || '' }
          : typeof body.story === 'string'
            ? JSON.parse(body.story)
            : body.story,
      mediaType: body.mediaType || 'image',
      mediaUrl: body.mediaUrl || '',
      courseId: body.courseId || undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
      order: body.order ? +body.order : 0,
    };
    return this.graduateService.create(dto, imageFilename);
  }

  @Get('manage')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bütün məzunlar (admin, səhifələnmiş)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllManage(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.graduateService.findAllManage(+page, +limit);
  }

  @Get('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tək məzun (admin)' })
  findOne(@Param('id') id: string) {
    return this.graduateService.findOne(id);
  }

  @Patch('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Məzun yenilə (admin)' })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile(new SharpPipe('graduates', 800, 85, true))
    imageFilename?: string,
  ) {
    const dto: Record<string, any> = {};

    if (body['name[az]'] || body['name[en]']) {
      dto.name = { az: body['name[az]'] || '', en: body['name[en]'] || '' };
    } else if (body.name) {
      dto.name =
        typeof body.name === 'string' ? JSON.parse(body.name) : body.name;
    }

    if (body['story[az]'] || body['story[en]']) {
      dto.story = {
        az: body['story[az]'] || '',
        en: body['story[en]'] || '',
      };
    } else if (body.story) {
      dto.story =
        typeof body.story === 'string' ? JSON.parse(body.story) : body.story;
    }

    if (body.mediaType !== undefined) dto.mediaType = body.mediaType;
    if (body.mediaUrl !== undefined) dto.mediaUrl = body.mediaUrl;
    if (body.courseId !== undefined) dto.courseId = body.courseId || null;
    if (body.isActive !== undefined)
      dto.isActive = body.isActive === 'true' || body.isActive === true;
    if (body.order !== undefined) dto.order = +body.order;

    return this.graduateService.update(id, dto, imageFilename);
  }

  @Delete('manage/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Məzun sil (admin)' })
  remove(@Param('id') id: string) {
    return this.graduateService.remove(id);
  }
}
