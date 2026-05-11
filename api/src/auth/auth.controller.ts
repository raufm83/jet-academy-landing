import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/multer/config';
import { SharpPipe } from 'src/pipes/sharp.pipe';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async register(
    @Body() body: any,
    @Request() req,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const createAuthDto: CreateAuthDto = {
      name: body.name || '',
      surname: body.surname,
      position: body.position,
      nameEn: body.nameEn,
      surnameEn: body.surnameEn,
      positionEn: body.positionEn,
      email: body.email || '',
      password: body.password || '',
      role: body.role || Role.USER,
    };

    if (req.user.role === Role.STAFF && createAuthDto.role === Role.ADMIN) {
      throw new ForbiddenException('Staff cannot create admin users');
    }
    let avatarUrl: string | undefined;
    if (avatar) {
      const sharpPipe = new SharpPipe('profile');
      const filename = await sharpPipe.transform(avatar);
      avatarUrl = filename ? `profile/${filename}` : undefined;
    }
    return this.authService.register(createAuthDto, avatarUrl);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiResponse({
    status: 200,
    description: 'Current user updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateMe(
    @Body() updateMeDto: UpdateMeDto,
    @Request() req,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    let avatarUrl: string | undefined;
    if (avatar) {
      const sharpPipe = new SharpPipe('profile');
      const filename = await sharpPipe.transform(avatar);
      avatarUrl = filename ? `profile/${filename}` : undefined;
    }
    return this.authService.updateMe(req.user.id, updateMeDto, avatarUrl);
  }
}
