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
import { CourseEligibilityService } from './course-eligibility.service';
import { CreateCourseEligibilityDto } from './dto/create-course-eligibility.dto';
import { UpdateCourseEligibilityDto } from './dto/update-course-eligibility.dto';
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

@ApiTags('Course Eligibility')
@Controller('course-eligibility')
@ApiBearerAuth('JWT-auth')
export class CourseEligibilityController {
  constructor(
    private readonly courseEligibilityService: CourseEligibilityService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Create a new course eligibility' })
  @ApiResponse({
    status: 201,
    description: 'Course eligibility created successfully',
  })
  create(@Body() createCourseEligibilityDto: CreateCourseEligibilityDto) {
    return this.courseEligibilityService.create(createCourseEligibilityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course eligibility criteria' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: "Kurs ID-si. 'all' = hamısı, 'unassigned' = təyin edilməyib",
  })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
  ) {
    return this.courseEligibilityService.findAll(+page, +limit, courseId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific course eligibility' })
  findOne(@Param('id') id: string) {
    return this.courseEligibilityService.findOne(id);
  }

  @Patch('reorder/bulk')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Bulk reorder eligibility templates by global order' })
  reorder(
    @Body() body: { items: Array<{ id: string; order: number }> },
  ) {
    return this.courseEligibilityService.reorder(body?.items ?? []);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Update a course eligibility' })
  update(
    @Param('id') id: string,
    @Body() updateCourseEligibilityDto: UpdateCourseEligibilityDto,
  ) {
    return this.courseEligibilityService.update(id, updateCourseEligibilityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Delete a course eligibility' })
  remove(@Param('id') id: string) {
    return this.courseEligibilityService.remove(id);
  }

  @Post(':id/courses/:courseId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Add eligibility to a course' })
  addToCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Body() body: { order?: number },
  ) {
    return this.courseEligibilityService.addToCourse(id, courseId, body?.order);
  }

  @Patch(':id/courses/:courseId/order')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Update eligibility order in a course' })
  updateCourseOrder(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
    @Body() body: { order?: number },
  ) {
    return this.courseEligibilityService.updateCourseOrder(
      id,
      courseId,
      body?.order,
    );
  }

  @Delete(':id/courses/:courseId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER)
  @ApiOperation({ summary: 'Remove eligibility from a course' })
  removeFromCourse(
    @Param('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.courseEligibilityService.removeFromCourse(id, courseId);
  }
}
