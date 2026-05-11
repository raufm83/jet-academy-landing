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
  Request,
} from '@nestjs/common';
import { GlossaryService } from './glossary.service';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { UpdateGlossaryDto } from './dto/update-glossary.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Glossary')
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER, Role.AUTHOR)
  @ApiOperation({ summary: 'Create a new glossary term' })
  create(@Body() createGlossaryDto: CreateGlossaryDto, @Request() req: { user?: { id: string; role: string } }) {
    const authorId = req.user?.role === Role.AUTHOR ? req.user.id : undefined;
    return this.glossaryService.create(createGlossaryDto, authorId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all glossary terms' })
  @ApiParam({
    name: 'letter',
    required: false,
    description: 'Filter glossary terms by the first letter',
  })
  findAll(
    @Query('letter') letter: string,
    @Query('tag') tag: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('includeUnpublished') includeUnpublished = false,
    @Request() req: { user?: { id: string; role: Role } },
  ) {
    const authorId = req.user?.role === Role.AUTHOR ? req.user.id : undefined;
    return this.glossaryService.findAll(
      +page,
      +limit,
      includeUnpublished,
      letter,
      authorId,
      tag,
    );
  }
  @Get('brief')
  @ApiOperation({ summary: 'Get all glossary terms with brief information' })
  findAllBrief(
    @Query('limit') limit = 10,
    @Query('includeUnpublished') includeUnpublished = false,
    @Query('page') page = 1,
  ) {
    return this.glossaryService.findAllBrief(+limit, includeUnpublished, +page);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search glossary terms' })
  search(
    @Query('q') query: string,
    @Query('tag') tag?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('includeUnpublished') includeUnpublished = false,
    @Query('prioritizeIds') prioritizeIds?: string,
  ) {
    const pIds = prioritizeIds ? prioritizeIds.split(',') : [];
    return this.glossaryService.searchGlossary(
      query,
      tag,
      +page,
      +limit,
      categoryId,
      String(includeUnpublished) === 'true',
      pIds,
    );
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get glossary terms by category' })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.glossaryService.findByCategory(categoryId, +page, +limit);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get glossary term by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.glossaryService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get a specific glossary term' })
  findOne(@Param('id') id: string) {
    return this.glossaryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER, Role.AUTHOR)
  @ApiOperation({ summary: 'Update a glossary term' })
  update(
    @Param('id') id: string,
    @Body() updateGlossaryDto: UpdateGlossaryDto,
    @Request() req: { user?: { id: string; role: Role } },
  ) {
    return this.glossaryService.update(
      id,
      updateGlossaryDto,
      req.user?.id,
      req.user?.role as Role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.CONTENTMANAGER, Role.AUTHOR)
  @ApiOperation({ summary: 'Delete a glossary term' })
  remove(
    @Param('id') id: string,
    @Request() req: { user?: { id: string; role: Role } },
  ) {
    return this.glossaryService.remove(id, req.user?.id, req.user?.role as Role);
  }
}
