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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamService } from './team.service';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { multerConfig } from 'src/multer/config';

@ApiTags('Team')
@Controller('team')
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth('JWT-auth')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  private getMultilingualField(dto: any, field: string) {
    if (dto[`${field}[az]`] !== undefined || dto[`${field}[en]`] !== undefined) {
      return {
        az: dto[`${field}[az]`] || '',
        en: dto[`${field}[en]`] || '',
      };
    }

    return dto[field];
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createTeamDto: any,
    @UploadedFile(new SharpPipe('team', 600, 85)) imageUrl: string,
  ) {
    // Transform bio[az] and bio[en] to bio object
    const transformedDto: CreateTeamDto = {
      ...createTeamDto,
      name: this.getMultilingualField(createTeamDto, 'name'),
      surname: this.getMultilingualField(createTeamDto, 'surname'),
      bio:
        createTeamDto['bio[az]'] || createTeamDto['bio[en]']
          ? {
              az: createTeamDto['bio[az]'] || '',
              en: createTeamDto['bio[en]'] || '',
            }
          : createTeamDto.bio,
    };

    // Remove the nested format if exists
    delete transformedDto['name[az]'];
    delete transformedDto['name[en]'];
    delete transformedDto['surname[az]'];
    delete transformedDto['surname[en]'];
    delete transformedDto['bio[az]'];
    delete transformedDto['bio[en]'];

    return this.teamService.create({
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
    return this.teamService.findAll(+page, +limit);
  }

  @Get('active')
  getActive() {
    return this.teamService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: any,
    @UploadedFile(new SharpPipe('team', 600, 85)) imageUrl?: string,
  ) {
    // Transform bio[az] and bio[en] to bio object
    const transformedDto: UpdateTeamDto = {
      ...updateTeamDto,
      name: this.getMultilingualField(updateTeamDto, 'name'),
      surname: this.getMultilingualField(updateTeamDto, 'surname'),
      bio:
        updateTeamDto['bio[az]'] !== undefined ||
        updateTeamDto['bio[en]'] !== undefined
          ? {
              az: updateTeamDto['bio[az]'] || '',
              en: updateTeamDto['bio[en]'] || '',
            }
          : updateTeamDto.bio,
    };

    // Remove the nested format if exists
    delete transformedDto['name[az]'];
    delete transformedDto['name[en]'];
    delete transformedDto['surname[az]'];
    delete transformedDto['surname[en]'];
    delete transformedDto['bio[az]'];
    delete transformedDto['bio[en]'];

    return this.teamService.update(id, {
      ...transformedDto,
      ...(imageUrl && { imageUrl }),
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  updateStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.teamService.updateStatus(id, isActive);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
