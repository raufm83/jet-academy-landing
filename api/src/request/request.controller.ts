import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RequestService } from './request.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateRequestDto, HONEYPOT_FIELD } from './dto/create-request.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role, Language } from '@prisma/client';

@ApiTags('Requests')
@Controller('requests')
@ApiBearerAuth('JWT-auth')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  private verifyMathCaptcha(dto: CreateRequestDto) {
    const { captchaA, captchaB, captchaAnswer } = dto;

    if (
      typeof captchaA !== 'number' ||
      typeof captchaB !== 'number' ||
      typeof captchaAnswer !== 'number' ||
      captchaA + captchaB !== captchaAnswer
    ) {
      throw new BadRequestException('CAPTCHA verification failed');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CRMOPERATOR, Role.COORDINATOR)
  @ApiOperation({
    summary: 'Get all requests',
    description: 'Retrieves a paginated list of all requests',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              surname: { type: 'string' },
              number: { type: 'string' },
              childAge: { type: 'number' },
              childLanguage: {
                type: 'string',
                enum: Object.values(Language),
              },
              status: { type: 'string' },
              viewedBy: { type: 'string' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.requestService.findAll(page, limit);
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @ApiOperation({
    summary: 'Create request',
    description: 'Creates a new request',
  })
  @ApiBody({
    type: CreateRequestDto,
    description: 'Request creation payload',
  })
  @ApiResponse({
    status: 201,
    description: 'Request created successfully',
    type: CreateRequestDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async createRequest(@Body() createRequestDto: CreateRequestDto) {
    const honeypot = createRequestDto[HONEYPOT_FIELD];
    if (typeof honeypot === 'string' && honeypot.trim() !== '') {
      throw new BadRequestException('Invalid request');
    }
    this.verifyMathCaptcha(createRequestDto);
    const {
      captchaA: _captchaA,
      captchaB: _captchaB,
      captchaAnswer: _captchaAnswer,
      ...rest
    } = createRequestDto;
    return this.requestService.createRequest(rest);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CRMOPERATOR, Role.COORDINATOR)
  @ApiOperation({
    summary: 'Get request by ID',
    description: 'Retrieves a specific request by its ID',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the request to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Request retrieved successfully',
    type: CreateRequestDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findOne(@Param('id') id: string) {
    return this.requestService.findOne(id);
  }

  @Post(':id/view')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CRMOPERATOR, Role.COORDINATOR)
  @ApiOperation({
    summary: 'Mark request as viewed',
    description: 'Marks a specific request as viewed by the current user',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the request to mark as viewed',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Request marked as viewed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async markAsViewed(@Param('id') id: string, @Request() req) {
    return this.requestService.markAsViewed(id, req.user.name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Delete request',
    description: 'Deletes a specific request. Only available to admin users.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the request to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async remove(@Param('id') id: string) {
    return this.requestService.remove(id);
  }
}
