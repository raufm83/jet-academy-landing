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
import { UpdateAboutPageDto } from './dto/update-about-page.dto';
import { AboutPageService } from './about-page.service';

@ApiTags('About Page (Admin)')
@Controller('about-page')
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN, Role.CONTENTMANAGER)
export class AboutPageController {
  constructor(private readonly aboutPageService: AboutPageService) {}

  @Get()
  @ApiOperation({ summary: 'Haqqımızda CMS redaktəsi' })
  getForEdit() {
    return this.aboutPageService.ensureForAdmin();
  }

  @Patch()
  @ApiOperation({ summary: 'Haqqımızda mətnlər' })
  update(@Body() dto: UpdateAboutPageDto) {
    return this.aboutPageService.update(dto);
  }

  @Post('intro-image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Intro şəkli' })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  uploadIntro(
    @UploadedFile(new SharpPipe('about-page', 1200, 85, true))
    filename: string | null,
  ) {
    return this.aboutPageService.saveIntroImage(filename);
  }

  @Post('mission-vision-image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Missiya/vizyon şəkli' })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  uploadMissionVision(
    @UploadedFile(new SharpPipe('about-page', 1200, 85, true))
    filename: string | null,
  ) {
    return this.aboutPageService.saveMissionVisionImage(filename);
  }
}
