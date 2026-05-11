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
  UseInterceptors,
  UploadedFile,
  Req,
  UsePipes,
  ValidationPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { SharpPipe } from '../pipes/sharp.pipe';
import { multerConfig } from '../multer/config';

@ApiTags('Courses')
@Controller('courses')
@UsePipes(new ValidationPipe({ transform: true }))
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /** Statik fayllar /uploads/* altındadır; APP_URL çox vaxt .../api ilə bitir — o zaman /api/uploads yanlış olur. */
  private generateImageUrl(filename: string, request: Request): string {
    const raw =
      process.env.APP_URL || `${request.protocol}://${request.get('host')}`;
    const base = raw.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${base}/uploads/courses/${filename}`;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({
    description: 'Course creation data with file upload',
    schema: {
      type: 'object',
      properties: {
        'title[az]': { type: 'string', example: 'IT və Kompüter Mühəndisliyi' },
        'title[en]': { type: 'string', example: 'IT and computer engineering' },
        'description[az]': {
          type: 'string',
          example: 'Tam stack veb proqramlaşdırma kursu',
        },
        'description[en]': {
          type: 'string',
          example: 'Full Stack Web Development Course',
        },
        'slug[az]': { type: 'string', example: 'full-stack-development' },
        'slug[en]': { type: 'string', example: 'full-stack-development' },
        duration: { type: 'number', example: 12 },
        'level[az]': { type: 'string', example: 'Başlanğıc' },
        'level[en]': { type: 'string', example: 'Beginner' },
        ageRange: { type: 'string', example: '9-15' },
        icon: { type: 'string', example: 'computer-icon.png' },
        'newTags[az]': {
          type: 'array',
          items: { type: 'string' },
          example: ['Scratch', 'HTML'],
        },
        'newTags[en]': {
          type: 'array',
          items: { type: 'string' },
          example: ['Scratch', 'HTML'],
        },
        published: { type: 'boolean', example: false },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Course image file',
        },
      },
    },
  })
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile(new SharpPipe('courses', 1200, 85, true)) imageFilename?: string,
    @Req() request?: Request,
  ) {
    if (imageFilename) {
      createCourseDto.imageUrl = this.generateImageUrl(imageFilename, request);
    }
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    /** Query parametri mətn olduğu üçün `"false"` truthy sayılmaması üçün ParseBoolPipe. */
    @Query(
      'includeUnpublished',
      new DefaultValuePipe(false),
      ParseBoolPipe,
    )
    includeUnpublished: boolean,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.courseService.findAll(+page, +limit, includeUnpublished, sortOrder);
  }

  @Get('brief')
  @ApiOperation({ summary: 'Get all courses with brief information' })
  findAllBrief(
    @Query('limit') limit = 10,
    @Query(
      'includeUnpublished',
      new DefaultValuePipe(false),
      ParseBoolPipe,
    )
    includeUnpublished: boolean,
    @Query('page') page = 1,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return this.courseService.findAllBrief(+limit, includeUnpublished, +page, sortOrder);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get course by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.courseService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a specific course' })
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch('reorder/bulk')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Bulk reorder courses (admin)' })
  @ApiBody({
    description: 'Sıralama üçün {id, order} siyahısı',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  reorder(@Body() body: { items: Array<{ id: string; order: number }> }) {
    return this.courseService.reorder(body?.items || []);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a course' })
  @ApiBody({
    description: 'Course update data with file upload',
    schema: {
      type: 'object',
      properties: {
        'title[az]': { type: 'string', example: 'IT və Kompüter Mühəndisliyi' },
        'title[en]': { type: 'string', example: 'IT and computer engineering' },
        'description[az]': {
          type: 'string',
          example: 'Tam stack veb proqramlaşdırma kursu',
        },
        'description[en]': {
          type: 'string',
          example: 'Full Stack Web Development Course',
        },
        'slug[az]': { type: 'string', example: 'full-stack-development' },
        'slug[en]': { type: 'string', example: 'full-stack-development' },
        duration: { type: 'number', example: 12 },
        'level[az]': { type: 'string', example: 'Başlanğıc' },
        'level[en]': { type: 'string', example: 'Beginner' },
        ageRange: { type: 'string', example: '9-15' },
        icon: { type: 'string', example: 'computer-icon.png' },
        'newTags[az]': {
          type: 'array',
          items: { type: 'string' },
          example: ['Scratch', 'HTML'],
        },
        'newTags[en]': {
          type: 'array',
          items: { type: 'string' },
          example: ['Scratch', 'HTML'],
        },
        published: { type: 'boolean', example: false },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Course image file',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile(new SharpPipe('courses', 1200, 85, true)) imageFilename?: string,
    @Req() request?: Request,
  ) {
    if (imageFilename) {
      updateCourseDto.imageUrl = this.generateImageUrl(imageFilename, request);
    }
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }
}
