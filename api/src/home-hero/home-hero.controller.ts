import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { multerConfig } from 'src/multer/config';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { UpdateHomeHeroDto } from './dto/update-home-hero.dto';
import { HomeHeroService } from './home-hero.service';

@ApiTags('Home Hero (Admin)')
@Controller('home-hero')
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.CONTENTMANAGER)
export class HomeHeroController {
  constructor(private readonly homeHeroService: HomeHeroService) {}

  @Get()
  @ApiOperation({ summary: 'Hero redaktəsi üçün cari dəyərlər' })
  getForEdit() {
    return this.homeHeroService.ensureForAdmin();
  }

  @Patch()
  @ApiOperation({ summary: 'Hero mətnləri və şəkil yolunu yenilə' })
  update(@Body() dto: UpdateHomeHeroDto) {
    return this.homeHeroService.update(dto);
  }

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Hero şəkli yüklə (WebP) və qeydə yaz',
  })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  uploadImage(
    @UploadedFile(new SharpPipe('home-hero', 920, 85, true))
    filename: string | null,
  ) {
    return this.homeHeroService.saveUploadedImage(filename);
  }
}
