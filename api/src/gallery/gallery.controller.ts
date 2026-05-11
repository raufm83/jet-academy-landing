import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryService } from './gallery.service';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { multerConfig } from 'src/multer/config';

@ApiTags('Gallery')
@Controller('gallery')
@ApiBearerAuth('JWT-auth')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createGalleryDto: any,
    @UploadedFile(new SharpPipe('gallery', 1600, 80, true)) imageUrl: string,
  ) {
    const transformedDto: CreateGalleryDto = {
      ...createGalleryDto,
      title:
        createGalleryDto['title[az]'] || createGalleryDto['title[en]']
          ? {
              az: createGalleryDto['title[az]'] || '',
              en: createGalleryDto['title[en]'] || '',
            }
          : createGalleryDto.title,
      imageAlt:
        createGalleryDto['imageAlt[az]'] || createGalleryDto['imageAlt[en]']
          ? {
              az: createGalleryDto['imageAlt[az]'] || '',
              en: createGalleryDto['imageAlt[en]'] || '',
            }
          : createGalleryDto.imageAlt,
    };

    // Remove the nested format if exists
    delete (transformedDto as any)['title[az]'];
    delete (transformedDto as any)['title[en]'];
    delete (transformedDto as any)['imageAlt[az]'];
    delete (transformedDto as any)['imageAlt[en]'];

    return this.galleryService.create({
      ...transformedDto,
      imageUrl,
    });
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.galleryService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() updateGalleryDto: any,
    @UploadedFile(new SharpPipe('gallery', 1600, 80, true)) imageUrl?: string,
  ) {
    const transformedDto: UpdateGalleryDto = {
      ...updateGalleryDto,
      title:
        updateGalleryDto['title[az]'] || updateGalleryDto['title[en]']
          ? {
              az: updateGalleryDto['title[az]'] || '',
              en: updateGalleryDto['title[en]'] || '',
            }
          : updateGalleryDto.title,
      imageAlt:
        updateGalleryDto['imageAlt[az]'] || updateGalleryDto['imageAlt[en]']
          ? {
              az: updateGalleryDto['imageAlt[az]'] || '',
              en: updateGalleryDto['imageAlt[en]'] || '',
            }
          : updateGalleryDto.imageAlt,
    };

    // Remove the nested format if exists
    delete (transformedDto as any)['title[az]'];
    delete (transformedDto as any)['title[en]'];
    delete (transformedDto as any)['imageAlt[az]'];
    delete (transformedDto as any)['imageAlt[en]'];

    return this.galleryService.update(id, {
      ...transformedDto,
      ...(imageUrl && { imageUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
