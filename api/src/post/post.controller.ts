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
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PublishPostDto } from './dto/publish-post.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role, PostType } from '@prisma/client';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { multerConfig } from 'src/multer/config';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly sharpPipe: SharpPipe,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.AUTHOR, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create post',
    description:
      'Creates a new post. Use imageAz / imageEn for per-locale images, or image for single image.',
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Post creation payload',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageAz', maxCount: 1 },
        { name: 'imageEn', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files: {
      imageAz?: Express.Multer.File[];
      imageEn?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Request() req,
  ) {
    let imageUrlAz: string | null = null;
    let imageUrlEn: string | null = null;
    const fileAz = files?.imageAz?.[0] ?? (!files?.imageEn?.[0] ? files?.image?.[0] : undefined);
    const fileEn = files?.imageEn?.[0];
    if (fileAz) {
      imageUrlAz = await this.sharpPipe.transform(fileAz);
    }
    if (fileEn) {
      imageUrlEn = await this.sharpPipe.transform(fileEn);
    }
    return this.postService.create(
      {
        ...createPostDto,
        imageUrlAz: imageUrlAz ?? undefined,
        imageUrlEn: imageUrlEn ?? undefined,
      },
      req.user.id,
      req.user.role,
    );
  }

  /** Post content (WYSIWYG) image: max 1024 px wide, height auto, WebP format */
  static readonly POST_CONTENT_IMAGE_SIZE = 1280;
  static readonly POST_CONTENT_WEBP_QUALITY = 82;

  @Post('upload-content-image')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.AUTHOR, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload image for post content (WYSIWYG)',
    description:
      'Uploads an image; resized to exactly 1024×1024 px, converted to WebP format, 90% quality. Returns path for use in editor.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadContentImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    const hasFile = file && (file.buffer || file.path);
    if (!hasFile) return { path: null };
    const contentImagePipe = new SharpPipe(
      'post-content',
      PostController.POST_CONTENT_IMAGE_SIZE,
      PostController.POST_CONTENT_WEBP_QUALITY,
      true,
    );
    const filename = await contentImagePipe.transform(file);
    if (!filename) return { path: null };
    return { path: `post-content/${filename}` };
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all posts',
    description:
      'Retrieves a paginated list of all posts. When authenticated as AUTHOR, returns only own BLOG posts.',
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
  @ApiQuery({
    name: 'includeUnpublished',
    required: false,
    type: Boolean,
    description:
      'Whether to include unpublished posts (requires admin/author role)',
    example: false,
  })
  @ApiQuery({
    name: 'includeBlogs',
    required: false,
    type: Boolean,
    description: 'Whether to include blog posts (requires admin/author role)',
    example: false,
  })
  @ApiQuery({
    name: 'eventStatus',
    required: false,
    type: String,
    description: 'Filter events by status (UPCOMING, PAST)',
    example: 'UPCOMING',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: String,
    description: 'Filter posts by author ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search posts by title (az/en/ru)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of posts retrieved successfully',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('includeUnpublished', new ParseBoolPipe({ optional: true }))
    includeUnpublished = false,
    @Query('postType') postType = null,
    @Query('includeBlogs', new ParseBoolPipe({ optional: true }))
    includeBlogs = false,
    @Query('eventStatus') eventStatus = null,
    @Query('authorId') authorId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Request() req?: { user?: { id: string; role: string } },
  ) {
    const user = req?.user;
    // Use query param authorId if provided, otherwise use authenticated user's id for AUTHOR role
    const effectiveAuthorId = authorId || (user?.role === Role.AUTHOR ? user?.id : undefined);
    return this.postService.findAll(
      page,
      limit,
      includeUnpublished,
      postType,
      includeBlogs,
      eventStatus,
      effectiveAuthorId,
      user?.role as Role,
      tag,
      search,
    );
  }

  @Get('type/:type')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get posts by type',
    description:
      'Retrieves posts filtered by type (BLOG, NEWS, EVENT). AUTHOR only gets own BLOG.',
  })
  @ApiParam({
    name: 'type',
    required: true,
    description: 'Type of posts to retrieve',
    enum: PostType,
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
  @ApiQuery({
    name: 'includeUnpublished',
    required: false,
    type: Boolean,
    description:
      'Whether to include unpublished posts (requires admin/author role)',
    example: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search posts by title (az/en/ru)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of posts retrieved successfully',
  })
  async getPostsByType(
    @Param('type') type: PostType,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('includeUnpublished') includeUnpublished = false,
    @Query('eventStatus') eventStatus?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Request() req?: { user?: { id: string; role: string } },
  ) {
    const user = req?.user;
    return this.postService.getPostsByType(
      type,
      +page,
      +limit,
      includeUnpublished,
      eventStatus,
      user?.id,
      user?.role as Role,
      tag,
      search,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.AUTHOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Get current author's blog posts",
    description:
      "Returns only the authenticated AUTHOR's own BLOG posts. Requires AUTHOR role.",
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'includeUnpublished', required: false, type: Boolean, example: true })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: "Author's blog posts" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - AUTHOR role required' })
  async findMy(
    @Request() req: { user: { id: string; role: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('includeUnpublished', new ParseBoolPipe({ optional: true }))
    includeUnpublished = true,
    @Query('search') search?: string,
  ) {
    return this.postService.findAll(
      page,
      limit,
      includeUnpublished,
      PostType.BLOG,
      true,
      undefined,
      req.user.id,
      Role.AUTHOR,
      undefined,
      search,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get post by slug',
    description: 'Retrieves a specific post by its slug',
  })
  @ApiParam({
    name: 'slug',
    required: true,
    description: 'Slug of the post to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get post by ID',
    description:
      'Retrieves a specific post by its ID. AUTHOR can only get own posts.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the post to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - AUTHOR can only view own posts',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req?: { user?: { id: string; role: string } },
  ) {
    const user = req?.user;
    return this.postService.findOne(id, user?.id, user?.role as Role);
  }

  /** JSON-only publish toggle — multipart PATCH often drops JSON body for list switches */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.AUTHOR, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Set post published flag',
    description:
      'Updates only published (application/json). Use this from the dashboard list; use PATCH /posts/:id with multipart for full edit.',
  })
  @ApiParam({ name: 'id', required: true, description: 'Post ID' })
  @ApiBody({ type: PublishPostDto })
  @ApiConsumes('application/json')
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async updatePublish(
    @Param('id') id: string,
    @Body() body: PublishPostDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.postService.updatePublishFlag(
      id,
      body.published,
      req.user.id,
      req.user.role as Role,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.AUTHOR, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update post',
    description:
      'Updates a specific post. Use imageAz / imageEn to set per-locale images.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the post to update',
    type: String,
  })
  @ApiBody({
    type: UpdatePostDto,
    description: 'Post update payload',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageAz', maxCount: 1 },
        { name: 'imageEn', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files?: {
      imageAz?: Express.Multer.File[];
      imageEn?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Request() req?: { user: { id: string; role: string } },
  ) {
    let imageUrlAz: string | undefined;
    let imageUrlEn: string | undefined;
    const fileAz = files?.imageAz?.[0] ?? (!files?.imageEn?.[0] ? files?.image?.[0] : undefined);
    const fileEn = files?.imageEn?.[0];
    if (fileAz) {
      imageUrlAz = await this.sharpPipe.transform(fileAz);
    }
    if (fileEn) {
      imageUrlEn = await this.sharpPipe.transform(fileEn);
    }
    return this.postService.update(
      id,
      {
        ...updatePostDto,
        imageUrlAz,
        imageUrlEn,
      },
      req?.user?.id,
      req?.user?.role as Role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.AUTHOR, Role.CONTENTMANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete post',
    description: 'Deletes a specific post. Authors can only delete their own posts.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the post to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.postService.remove(id, req.user.id, req.user.role as Role);
  }
}
