import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, PostType, EventStatus, Role } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as path from 'path';
import { slugifyText } from 'src/utils/slugify';

@Injectable()
export class PostService {
  private readonly uploadDir = 'uploads-acad';
  private readonly teamImageDir = 'post';

  private getRelativeImagePath(filename: string | null): string | null {
    return filename ? path.join(this.teamImageDir, filename) : null;
  }

  private getAbsoluteImagePath(filename: string): string {
    return path.join(
      process.cwd(),
      this.uploadDir,
      this.teamImageDir,
      filename,
    );
  }

  private processMultilingualFields(dto: any) {
    const multilingualFields = ['title', 'content', 'slug', 'imageAlt'];
    const processedData: any = { ...dto };
    const result: any = {};
    const normalizeTagList = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map((item) => String(item ?? '').trim())
          .filter(Boolean);
      }
      if (typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => String((value as Record<string, unknown>)[key] ?? '').trim())
          .filter(Boolean);
      }
      const single = String(value).trim();
      return single ? [single] : [];
    };
    const extractLegacyTags = (lang: 'az' | 'en'): string[] => {
      const tagEntries = Object.keys(dto)
        .filter((key) => new RegExp(`^tags\\[${lang}\\]\\[\\d+\\]$`).test(key))
        .sort((a, b) => {
          const aIndex = Number(a.match(/\[(\d+)\]$/)?.[1] ?? 0);
          const bIndex = Number(b.match(/\[(\d+)\]$/)?.[1] ?? 0);
          return aIndex - bIndex;
        })
        .map((key) => String(dto[key] ?? '').trim())
        .filter(Boolean);

      return tagEntries;
    };

    multilingualFields.forEach((field) => {
      if (dto[`${field}[az]`] != null || dto[`${field}[en]`] != null) {
        result[field] = {
          az: dto[`${field}[az]`] ?? '',
          en: dto[`${field}[en]`] ?? '',
        };
        delete processedData[`${field}[az]`];
        delete processedData[`${field}[en]`];
      } else if (
        dto[field] &&
        typeof dto[field] === 'object' &&
        ('az' in dto[field] || 'en' in dto[field])
      ) {
        result[field] = {
          az: dto[field].az ?? '',
          en: dto[field].en ?? '',
        };
        delete processedData[field];
      }
    });

    let tagsPayload = dto?.tags;

    if (typeof tagsPayload === 'string') {
      const trimmedTags = tagsPayload.trim();
      if (trimmedTags) {
        try {
          tagsPayload = JSON.parse(trimmedTags);
        } catch {
          tagsPayload = trimmedTags;
        }
      } else {
        tagsPayload = { az: [], en: [] };
      }
    }

    let rawTagsAz =
      tagsPayload &&
      typeof tagsPayload === 'object' &&
      !Array.isArray(tagsPayload)
        ? (tagsPayload as Record<string, unknown>).az
        : undefined;
    let rawTagsEn =
      tagsPayload &&
      typeof tagsPayload === 'object' &&
      !Array.isArray(tagsPayload)
        ? (tagsPayload as Record<string, unknown>).en
        : undefined;

    if (rawTagsAz == null && rawTagsEn == null) {
      const legacyAzTags = extractLegacyTags('az');
      const legacyEnTags = extractLegacyTags('en');
      if (legacyAzTags.length > 0 || legacyEnTags.length > 0) {
        rawTagsAz = legacyAzTags;
        rawTagsEn = legacyEnTags;
      }
    }

    if (rawTagsAz != null || rawTagsEn != null) {
      const azTags = normalizeTagList(rawTagsAz);
      const enTags = normalizeTagList(rawTagsEn);
      const maxLength = Math.max(azTags.length, enTags.length);

      processedData.tags = Array.from({ length: maxLength }, (_, index) => ({
        ...(azTags[index] ? { az: azTags[index] } : {}),
        ...(enTags[index] ? { en: enTags[index] } : {}),
      })).filter((tag) => Object.keys(tag).length > 0);
    } else if (Array.isArray(tagsPayload)) {
      processedData.tags = tagsPayload
        .map((tag) => {
          if (typeof tag === 'string') {
            const normalized = tag.trim();
            return normalized ? { az: normalized, en: normalized } : null;
          }
          if (typeof tag === 'object' && tag !== null) {
            const localizedTag = tag as Record<string, unknown>;
            const normalizedTag = {
              ...(normalizeTagList(localizedTag.az)[0]
                ? { az: normalizeTagList(localizedTag.az)[0] }
                : {}),
              ...(normalizeTagList(localizedTag.en)[0]
                ? { en: normalizeTagList(localizedTag.en)[0] }
                : {}),
            };
            return Object.keys(normalizedTag).length > 0 ? normalizedTag : null;
          }
          return null;
        })
        .filter(Boolean);
    } else if (processedData.tags != null && !Array.isArray(processedData.tags)) {
      if (
        processedData.tags &&
        typeof processedData.tags === 'object' &&
        ('az' in processedData.tags || 'en' in processedData.tags)
      ) {
        const azTags = normalizeTagList((processedData.tags as Record<string, unknown>).az);
        const enTags = normalizeTagList((processedData.tags as Record<string, unknown>).en);
        const maxLength = Math.max(azTags.length, enTags.length);

        processedData.tags = Array.from({ length: maxLength }, (_, index) => ({
          ...(azTags[index] ? { az: azTags[index] } : {}),
          ...(enTags[index] ? { en: enTags[index] } : {}),
        })).filter((tag) => Object.keys(tag).length > 0);
      } else {
        processedData.tags = Object.keys(processedData.tags)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => processedData.tags[k])
          .filter((v) => v != null && v !== '');
      }
    }

    Object.keys(processedData)
      .filter((key) => /^tags\[(az|en)\]\[\d+\]$/.test(key))
      .forEach((key) => {
        delete processedData[key];
      });

    return { ...processedData, ...result };
  }

  /** SlugI18n — Prisma həm `az`, həm `en` string gözləyir; URL üçün transliterasiya */
  private ensureSlugI18n(slug: {
    az?: unknown;
    en?: unknown;
  }): { az: string; en: string } {
    const rawAz = String(slug?.az ?? '').trim();
    const rawEn = String(slug?.en ?? slug?.az ?? '').trim();
    return { az: slugifyText(rawAz), en: slugifyText(rawEn) };
  }

  /** API response üçün imageUrl-i həmişə { az?, en? } obyektinə çevirir (Json və ya köhnə string) */
  private normalizeImageUrl(post: any): any {
    if (!post) return post;
    const raw = post.imageUrl;
    let normalized: { az?: string; en?: string } | null = null;
    if (
      raw &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      ('az' in (raw as object) || 'en' in (raw as object))
    ) {
      const o = raw as { az?: string; en?: string };
      normalized = {
        az: o.az ?? undefined,
        en: o.en ?? undefined,
      };
    } else if (typeof raw === 'string' && raw) {
      normalized = { az: raw, en: raw };
    }
    return { ...post, imageUrl: normalized };
  }

  /**
   * Determines the EventStatus based on the offer dates
   * For offers, we consider:
   * - No offerEndDate means it's ONGOING indefinitely
   * - If offerEndDate is in the future, it's UPCOMING
   * - If offerEndDate is today or later (and offerStartDate has passed or is today), it's ONGOING
   * - If offerEndDate has passed, it's PAST
   */
  private determineOfferStatus(
    offerStartDate?: Date | null,
    offerEndDate?: Date | null,
    eventDate?: Date | string | null,
  ): EventStatus {
    const now = new Date();

    // Prioritize eventDate (unified date picker)
    if (eventDate) {
      const eDate = new Date(eventDate);
      if (!isNaN(eDate.getTime())) {
        // If eventDate is in the future, the offer is valid (ONGOING)
        // If it has passed, it is PAST
        return eDate > now ? EventStatus.ONGOING : EventStatus.PAST;
      }
    }

    // Fallback logic for legacy dates
    if (offerEndDate) {
      const endDate = new Date(offerEndDate);
      return endDate >= now ? EventStatus.ONGOING : EventStatus.PAST;
    }

    return EventStatus.ONGOING;
  }

  /**
   * Determines the EventStatus based on the event date
   */
  private determineEventStatus(
    eventDate?: Date | string | null,
  ): EventStatus | undefined {
    if (!eventDate) return undefined;
    const date = new Date(eventDate);
    const now = new Date();

    // If invalid date, return undefined
    if (isNaN(date.getTime())) return undefined;

    return date > now ? EventStatus.UPCOMING : EventStatus.PAST;
  }

  /** BLOG tipi üçün: boş ⇒ kateqoriya yox; əks halda mövcud id tələb olunur */
  private async resolveBlogCategoryForCreate(
    postType: PostType,
    raw: unknown,
  ): Promise<string | undefined> {
    if (postType !== PostType.BLOG) return undefined;
    const s = typeof raw === 'string' ? raw.trim() : '';
    if (!s) return undefined;
    const cat = await this.prisma.blogCategory.findUnique({
      where: { id: s },
      select: { id: true },
    });
    if (!cat) {
      throw new BadRequestException('Invalid blogCategoryId');
    }
    return s;
  }

  /**
   * PATCH: göndərilməyibsə undefined; göndərilib boşdtsa və ya növ BLOG deyilsə null; əks halda mövcud id.
   */
  private async resolveBlogCategoryForUpdate(
    dto: UpdatePostDto,
    effectivePostType: PostType,
  ): Promise<string | null | undefined> {
    const hasProp = Object.prototype.hasOwnProperty.call(dto, 'blogCategoryId');
    if (!hasProp) return undefined;
    if (effectivePostType !== PostType.BLOG) return null;
    const raw = dto.blogCategoryId;
    const s = raw === undefined || raw === null ? '' : String(raw).trim();
    if (!s) return null;
    const cat = await this.prisma.blogCategory.findUnique({
      where: { id: s },
      select: { id: true },
    });
    if (!cat) {
      throw new BadRequestException('Invalid blogCategoryId');
    }
    return s;
  }

  constructor(private prisma: PrismaService) { }

  async create(
    createPostDto: CreatePostDto & {
      imageUrl?: string;
      imageUrlAz?: string | null;
      imageUrlEn?: string | null;
    },
    authorId: string,
    userRole?: Role,
  ) {
    if (userRole === Role.AUTHOR) {
      const postType = createPostDto.postType ?? (CreatePostDto as any).postType;
      if (postType && postType !== PostType.BLOG) {
        throw new ForbiddenException('Authors can only create blog posts');
      }
    }
    try {
      const dto =
        userRole === Role.AUTHOR
          ? { ...createPostDto, postType: PostType.BLOG as any }
          : createPostDto;
      const processedData = this.processMultilingualFields(dto);
      const blogCatRaw = processedData.blogCategoryId;
      delete processedData.blogCategoryId;

      const azPath = createPostDto.imageUrlAz
        ? this.getRelativeImagePath(createPostDto.imageUrlAz)
        : createPostDto.imageUrl
          ? this.getRelativeImagePath(createPostDto.imageUrl)
          : null;
      const enPath = createPostDto.imageUrlEn
        ? this.getRelativeImagePath(createPostDto.imageUrlEn)
        : createPostDto.imageUrl
          ? this.getRelativeImagePath(createPostDto.imageUrl)
          : null;

      const imageUrlJson =
        azPath || enPath
          ? {
            ...(azPath && { az: azPath }),
            ...(enPath && { en: enPath }),
          }
          : null;

      let eventStatus = createPostDto.eventStatus;

      if (
        createPostDto.postType === PostType.OFFERS &&
        (createPostDto.offerEndDate || createPostDto.eventDate)
      ) {
        eventStatus = this.determineOfferStatus(
          createPostDto.offerStartDate as any,
          createPostDto.offerEndDate as any,
          createPostDto.eventDate,
        );
      } else if (createPostDto.eventDate) {
        eventStatus = this.determineEventStatus(createPostDto.eventDate);
      }

      let isPublished = String(createPostDto.published) === 'true';
      if (
        createPostDto.postType === PostType.OFFERS &&
        eventStatus === EventStatus.PAST
      ) {
        isPublished = false;
      }

      const title =
        processedData.title && typeof processedData.title === 'object'
          ? {
            az: String(processedData.title.az ?? '').trim(),
            en: String(processedData.title.en ?? '').trim(),
          }
          : { az: '', en: '' };
      const content =
        processedData.content && typeof processedData.content === 'object'
          ? {
            az: String(processedData.content.az ?? ''),
            en: String(processedData.content.en ?? ''),
          }
          : { az: '', en: '' };
      const rawSlug = processedData.slug;
      const slug = this.ensureSlugI18n(
        rawSlug && typeof rawSlug === 'object'
          ? rawSlug
          : { az: '', en: '' },
      );

      if (!slug.az || !title.az) {
        throw new BadRequestException(
          'title[az] and slug[az] are required',
        );
      }

      const effectivePostType = dto.postType ?? PostType.BLOG;
      const blogCategoryIdResolved = await this.resolveBlogCategoryForCreate(
        effectivePostType,
        blogCatRaw,
      );

      const created = await this.prisma.post.create({
        // `prisma generate` çalışana qədər köhnə client bu sahə üçün `never` verə bilər
        data: {
          title,
          content,
          slug,
          imageUrl: imageUrlJson,
          published: isPublished,
          eventStatus: eventStatus ?? undefined,
          postType: dto.postType ?? PostType.BLOG,
          eventDate: processedData.eventDate
            ? new Date(processedData.eventDate)
            : undefined,
          offerStartDate: processedData.offerStartDate
            ? new Date(processedData.offerStartDate)
            : undefined,
          offerEndDate: processedData.offerEndDate
            ? new Date(processedData.offerEndDate)
            : undefined,
          imageAlt: processedData.imageAlt ?? undefined,
          tags: Array.isArray(processedData.tags) ? processedData.tags : [],
          ...(blogCategoryIdResolved
            ? { blogCategoryId: blogCategoryIdResolved }
            : {}),
          author: {
            connect: { id: authorId },
          },
        } as unknown as Parameters<typeof this.prisma.post.create>[0]["data"],
      });
      return this.normalizeImageUrl(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create post: ${error.message}`);
      }
      throw error;
    }
  }

  /** Teq mətni (AZ və ya EN) ilə üst-üstə düşən postlar */
  private postHasTag(tags: unknown, needle: string): boolean {
    const n = needle.trim();
    if (!n) return false;
    if (!Array.isArray(tags)) return false;
    return tags.some((t) => {
      if (typeof t === 'string') return t.trim() === n;
      if (t && typeof t === 'object') {
        const o = t as Record<string, unknown>;
        const az = String(o.az ?? '').trim();
        const en = String(o.en ?? '').trim();
        return az === n || en === n;
      }
      return false;
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    includeUnpublished = false,
    postType?: PostType | null,
    includeBlogs = false,
    eventStatus?: string | null,
    authorId?: string,
    userRole?: Role,
    tag?: string | null,
    blogCategoryId?: string | null,
  ) {
    try {
      const skip = (page - 1) * limit;
      let whereClause: any = includeUnpublished ? {} : { published: true };

      if (userRole === Role.AUTHOR && authorId) {
        whereClause = { ...whereClause, authorId, postType: PostType.BLOG };
      } else if (postType !== null && postType !== undefined) {
        whereClause = { ...whereClause, postType };
      } else if (!Boolean(includeBlogs)) {
        whereClause = { ...whereClause, postType: { not: PostType.BLOG } };
      }



      if (
        postType === PostType.EVENT &&
        eventStatus
      ) {
        const now = new Date();
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        if (eventStatus === 'UPCOMING') {
          whereClause = {
            ...whereClause,
            eventDate: { gte: startOfToday },
          };
        } else if (eventStatus === 'PAST') {
          whereClause = {
            ...whereClause,
            eventDate: { lt: startOfToday },
          };
        }
      } else if (eventStatus && postType !== PostType.EVENT) {
        whereClause = { ...whereClause, eventStatus };
      }

      // If authorId is provided (from query param or user context), filter by it
      // But if userRole is AUTHOR, we already filtered above, so skip here
      if (authorId && userRole !== Role.AUTHOR) {
        whereClause = { ...whereClause, authorId };
      }

      const catFilterRaw =
        typeof blogCategoryId === 'string' ? blogCategoryId.trim() : '';
      if (catFilterRaw && postType === PostType.BLOG) {
        const catLower = catFilterRaw.toLowerCase();
        if (catLower === 'uncategorized' || catLower === 'none') {
          whereClause = { ...whereClause, blogCategoryId: null };
        } else {
          whereClause = { ...whereClause, blogCategoryId: catFilterRaw };
        }
      }

      await this.updateOfferStatuses();
      await this.updateEventStatuses();

      const tagTrim = tag?.trim();
      if (tagTrim) {
        const allItems = await this.prisma.post.findMany({
          where: whereClause,
          orderBy:
            postType === PostType.EVENT
              ? { eventDate: 'desc' }
              : { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        const filtered = allItems.filter((p) =>
          this.postHasTag(p.tags, tagTrim),
        );
        const total = filtered.length;
        const items = filtered
          .slice(skip, skip + +limit)
          .map((p) => this.normalizeImageUrl(p));
        return {
          items,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
          },
        };
      }

      const [total, items] = await Promise.all([
        this.prisma.post.count({
          where: whereClause,
        }),
        this.prisma.post.findMany({
          where: whereClause,
          skip,
          take: +limit,
          orderBy:
            postType === PostType.EVENT
              ? { eventDate: 'desc' }
              : { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

      return {
        items: items.map((p) => this.normalizeImageUrl(p)),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Database query failed:', error);
      return {
        items: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
  }

  async findOne(id: string, userId?: string, userRole?: Role) {
    await this.updateOfferStatus(id);

    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: { select: { socialLinks: true, avatarUrl: true, profession: true } },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (userRole === Role.AUTHOR && userId && post.authorId !== userId) {
      throw new ForbiddenException('You can only view your own posts');
    }

    if (post.postType === PostType.EVENT && post.eventDate) {
      const newStatus = this.determineEventStatus(post.eventDate);
      if (newStatus && post.eventStatus !== newStatus) {
        const updated = await this.prisma.post.update({
          where: { id },
          data: { eventStatus: newStatus },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                profile: { select: { socialLinks: true, avatarUrl: true, profession: true } },
              },
            },
          },
        });
        return this.normalizeImageUrl(updated);
      }
    }

    return this.normalizeImageUrl(post);
  }

  /** Dashboard list: JSON-only publish toggle (no multipart). */
  async updatePublishFlag(
    id: string,
    published: boolean,
    userId?: string,
    userRole?: Role,
  ) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (userRole === Role.AUTHOR && existingPost.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updated = await this.prisma.post.update({
      where: { id },
      data: { published },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return this.normalizeImageUrl(updated);
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId?: string,
    userRole?: Role,
  ) {
    try {
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
        include: { author: { select: { id: true, name: true } } },
      });
      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      if (userRole === Role.AUTHOR) {
        if (existingPost.authorId !== userId) {
          throw new ForbiddenException('You can only edit your own posts');
        }
        if (
          updatePostDto.postType !== undefined &&
          updatePostDto.postType !== PostType.BLOG
        ) {
          throw new ForbiddenException(
            'Authors can only have BLOG type posts',
          );
        }
      }

      const processedData = this.processMultilingualFields(updatePostDto);

      ['title', 'content', 'slug'].forEach((field) => {
        if (processedData[field]) {
          processedData[field] = {
            ...(existingPost[field] as Record<string, unknown>),
            ...processedData[field],
          };
        }
      });

      if (processedData.slug) {
        processedData.slug = this.ensureSlugI18n(
          processedData.slug as { az?: unknown; en?: unknown },
        );
      }

      const existingRaw = existingPost.imageUrl;
      let existingI18n: { az?: string; en?: string } = {};
      if (typeof existingRaw === 'string' && existingRaw) {
        existingI18n = { az: existingRaw, en: existingRaw };
      } else if (
        existingRaw &&
        typeof existingRaw === 'object' &&
        !Array.isArray(existingRaw)
      ) {
        const o = existingRaw as { az?: string; en?: string };
        existingI18n = { az: o.az, en: o.en };
      }

      let imageUrlAz = updatePostDto.imageUrlAz
        ? this.getRelativeImagePath(updatePostDto.imageUrlAz)
        : existingI18n.az;
      let imageUrlEn = updatePostDto.imageUrlEn
        ? this.getRelativeImagePath(updatePostDto.imageUrlEn)
        : existingI18n.en;
      if (updatePostDto.imageUrl) {
        const single = this.getRelativeImagePath(updatePostDto.imageUrl);
        imageUrlAz = imageUrlAz ?? single;
        imageUrlEn = imageUrlEn ?? single;
      }
      const imageUrlJson =
        imageUrlAz || imageUrlEn
          ? {
            ...(imageUrlAz && { az: imageUrlAz }),
            ...(imageUrlEn && { en: imageUrlEn }),
          }
          : undefined;
      const imageData =
        imageUrlJson !== undefined ? { imageUrl: imageUrlJson } : {};

      const allowedKeys = new Set([
        'title',
        'content',
        'slug',
        'published',
        'imageAlt',
        'tags',
        'postType',
        'eventDate',
        'eventStatus',
        'offerStartDate',
        'offerEndDate',
      ]);
      Object.keys(processedData).forEach((key) => {
        if (!allowedKeys.has(key)) delete processedData[key];
      });
      delete processedData.imageUrl;
      delete processedData.imageUrlI18n;

      let eventStatus = updatePostDto.eventStatus || existingPost.eventStatus;
      const postType = updatePostDto.postType || existingPost.postType;

      const blogCatMutation = await this.resolveBlogCategoryForUpdate(
        updatePostDto,
        postType,
      );

      if (
        postType === PostType.OFFERS &&
        (updatePostDto.offerEndDate ||
          existingPost.offerEndDate ||
          updatePostDto.eventDate ||
          existingPost.eventDate)
      ) {
        const offerEndDate =
          updatePostDto.offerEndDate || existingPost.offerEndDate;
        const offerStartDate =
          updatePostDto.offerStartDate || existingPost.offerStartDate;
        const eventDate = updatePostDto.eventDate || existingPost.eventDate;
        eventStatus = this.determineOfferStatus(
          offerStartDate as any,
          offerEndDate as any,
          eventDate,
        );
      } else {
        const eventDate = updatePostDto.eventDate || existingPost.eventDate;
        if (eventDate) {
          eventStatus = this.determineEventStatus(eventDate);
        }
      }

      if (updatePostDto.published !== undefined) {
        const on =
          updatePostDto.published === true ||
          String(updatePostDto.published) === 'true';
        processedData.published = on;
      }

      const updateData: any = {
        ...processedData,
        ...imageData,
        eventStatus: eventStatus,
      };

      if (postType !== PostType.BLOG) {
        updateData.blogCategoryId = null;
      } else if (blogCatMutation !== undefined) {
        updateData.blogCategoryId = blogCatMutation;
      }

      const updated = await this.prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return this.normalizeImageUrl(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update post: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string, userRole?: Role) {
    try {
      await this.findOne(id, userId, userRole);
      await this.prisma.post.delete({ where: { id } });
      return { id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to delete post: ${error.message}`);
      }
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      // Optimization: Fetch first without global status update to avoid scanning entire DB
      const post = await this.prisma.post.findFirst({
        where: {
          OR: [
            {
              slug: {
                is: { az: { equals: slug } },
              },
            },
            {
              slug: {
                is: { en: { equals: slug } },
              },
            },
          ],
          published: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              profile: { select: { socialLinks: true, avatarUrl: true, profession: true } },
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with slug ${slug} not found`);
      }

      // If it's an offer, update ONLY its status specifically
      if (post.postType === PostType.OFFERS) {
        await this.updateOfferStatus(post.id);
        return this.findOne(post.id);
      }

      // If it's an event, update its status
      if (post.postType === PostType.EVENT && post.eventDate) {
        const newStatus = this.determineEventStatus(post.eventDate);
        if (newStatus && post.eventStatus !== newStatus) {
          await this.prisma.post.update({
            where: { id: post.id },
            data: { eventStatus: newStatus },
          });
          return this.findOne(post.id);
        }
      }

      return this.normalizeImageUrl(post);
    } catch (error) {
      throw error;
    }
  }

  async getPostsByType(
    type: PostType,
    page = 1,
    limit = 10,
    includeUnpublished = false,
    eventStatus?: string,
    authorId?: string,
    userRole?: Role,
    tag?: string | null,
    blogCategoryId?: string | null,
  ) {
    if (userRole === Role.AUTHOR && type !== PostType.BLOG) {
      return {
        items: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
    return this.findAll(
      page,
      limit,
      includeUnpublished,
      type,
      false,
      eventStatus,
      authorId,
      userRole,
      tag,
      blogCategoryId,
    );
  }

  /**
   * Updates the status of a specific offer post
   */
  async updateOfferStatus(postId: string): Promise<void> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: {
          postType: true,
          offerStartDate: true,
          offerEndDate: true,
          eventDate: true,
          eventStatus: true,
          published: true,
        },
      });

      if (!post || post.postType !== PostType.OFFERS) {
        return;
      }

      const newStatus = this.determineOfferStatus(
        post.offerStartDate,
        post.offerEndDate,
        post.eventDate,
      );

      const shouldUnpublish =
        newStatus === EventStatus.PAST &&
        post.published &&
        post.eventStatus !== EventStatus.PAST;
      const shouldRepublish =
        post.eventStatus === EventStatus.PAST &&
        newStatus !== EventStatus.PAST &&
        !post.published;
      const statusChanged = post.eventStatus !== newStatus;

      if (statusChanged || shouldUnpublish || shouldRepublish) {
        const data: { eventStatus: EventStatus; published?: boolean } = {
          eventStatus: newStatus,
        };
        if (shouldUnpublish) {
          data.published = false;
        } else if (shouldRepublish) {
          data.published = true;
        }
        await this.prisma.post.update({
          where: { id: postId },
          data,
        });
      }
    } catch (error) {
      console.error(`Failed to update offer status for post ${postId}:`, error);
    }
  }

  /**
   * Updates the status of all offer posts
   * This is used when querying posts to ensure statuses are current
   */
  async updateOfferStatuses(): Promise<void> {
    try {
      const offerPosts = await this.prisma.post.findMany({
        where: {
          postType: PostType.OFFERS,
        },
        select: {
          id: true,
          offerStartDate: true,
          offerEndDate: true,
          eventDate: true,
          eventStatus: true,
          published: true,
        },
      });

      const updates = offerPosts.map((post) => {
        const newStatus = this.determineOfferStatus(
          post.offerStartDate,
          post.offerEndDate,
          post.eventDate,
        );

        const shouldUnpublish =
          newStatus === EventStatus.PAST &&
          post.published &&
          post.eventStatus !== EventStatus.PAST;
        const shouldRepublish =
          post.eventStatus === EventStatus.PAST &&
          newStatus !== EventStatus.PAST &&
          !post.published;
        const statusChanged = post.eventStatus !== newStatus;

        if (statusChanged || shouldUnpublish || shouldRepublish) {
          const data: { eventStatus: EventStatus; published?: boolean } = {
            eventStatus: newStatus,
          };
          if (shouldUnpublish) {
            data.published = false;
          } else if (shouldRepublish) {
            data.published = true;
          }
          console.log(
            `Auto-updating offer ${post.id}: status ${post.eventStatus} -> ${newStatus}, published ${post.published} -> ${data.published ?? '(unchanged)'}`,
          );
          return this.prisma.post.update({
            where: { id: post.id },
            data,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
    } catch (error) {
      console.error('Failed to update offer statuses:', error);
    }
  }

  /**
   * Updates the status of all event posts
   */
  async updateEventStatuses(): Promise<void> {
    try {
      const eventPosts = await this.prisma.post.findMany({
        where: {
          postType: PostType.EVENT,
          // We might want to check unpublished ones too if we want to keep data clean,
          // but mainly we care about what's shown.
          // Let's check all to represent true state.
        },
        select: {
          id: true,
          eventDate: true,
          eventStatus: true,
        },
      });

      const updates = eventPosts.map((post) => {
        const newStatus = this.determineEventStatus(post.eventDate);

        if (newStatus && post.eventStatus !== newStatus) {
          return this.prisma.post.update({
            where: { id: post.id },
            data: { eventStatus: newStatus },
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
    } catch (error) {
      console.error('Failed to update event statuses:', error);
    }
  }
}
