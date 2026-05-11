import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import { UpdateGlossaryDto } from './dto/update-glossary.dto';

/** Extract all tag strings from a bilingual tags object or legacy string array. */
function extractAllTagStrings(tags: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean);
  const az: string[] = Array.isArray(tags.az) ? tags.az : [];
  const en: string[] = Array.isArray(tags.en) ? tags.en : [];
  return Array.from(new Set([...az, ...en].map((t) => t.trim().toLowerCase()).filter(Boolean)));
}

@Injectable()
export class GlossaryService {
  constructor(private prisma: PrismaService) {}

  private processMultilingualFields(dto: any) {
    const multilingualFields = ['term', 'definition', 'slug'];
    const processedData: any = { ...dto };
    const result: any = {};

    multilingualFields.forEach((field) => {
      if (dto[`${field}[az]`] || dto[`${field}[en]`]) {
        result[field] = {
          az: dto[`${field}[az]`],
          en: dto[`${field}[en]`],
        };
        delete processedData[`${field}[az]`];
        delete processedData[`${field}[en]`];
      }
    });

    return { ...processedData, ...result };
  }

  private readonly includeRelations = {
    category: true,
  };

  private readonly authorSelect = {
    id: true,
    name: true,
    role: true,
    profile: { select: { avatarUrl: true, profession: true, socialLinks: true } },
  };

  async create(createGlossaryDto: CreateGlossaryDto, authorId?: string) {
    try {
      const processedData = this.processMultilingualFields(createGlossaryDto);

      return await this.prisma.glossary.create({
        data: {
          ...processedData,
          ...(authorId && { authorId }),
        },
        include: {
          ...this.includeRelations,
          author: { select: this.authorSelect },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create glossary term: ${error.message}`);
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    includeUnpublished = false,
    letter = '',
    authorId?: string,
    tag = '',
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: Prisma.GlossaryWhereInput =
        authorId != null
          ? { authorId }
          : includeUnpublished
            ? {}
            : { published: true };

      const allItems = await this.prisma.glossary.findMany({
        where,
        include: this.includeRelations,
      });

      let filteredItems = letter
        ? allItems.filter((item) =>
            item.term?.az?.toLowerCase().startsWith(letter.toLowerCase()),
          )
        : allItems;

      if (tag) {
        const lowerTag = tag.toLowerCase().trim();
        filteredItems = filteredItems.filter((item) => {
          const itemTags = extractAllTagStrings(item.tags);
          return itemTags.some((t) => t === lowerTag);
        });
      }

      const sorted = filteredItems.sort(
        (a, b) => a.term?.az?.localeCompare(b.term?.az || '') || 0,
      );

      const paginated = sorted.slice(skip, skip + limit);

      return {
        items: paginated,
        meta: {
          total: filteredItems.length,
          page,
          limit,
          totalPages: Math.ceil(filteredItems.length / limit),
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

  async findAllBrief(limit = 10, includeUnpublished = false, page = 1) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = includeUnpublished ? {} : { published: true };

      const [total, items] = await Promise.all([
        this.prisma.glossary.count({
          where: whereClause,
        }),
        this.prisma.glossary.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            term: true,
            slug: true,
            categoryId: true,
            published: true,
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            term: {
              az: 'asc',
            },
          },
        }),
      ]);

      return {
        items,
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

  async findOne(id: string) {
    const glossaryTerm = await this.prisma.glossary.findUnique({
      where: { id },
      include: {
        ...this.includeRelations,
        author: { select: this.authorSelect },
      },
    });

    if (!glossaryTerm) {
      throw new NotFoundException(`Glossary term with ID ${id} not found`);
    }

    return glossaryTerm;
  }

  async update(
    id: string,
    updateGlossaryDto: UpdateGlossaryDto,
    userId?: string,
    userRole?: Role,
  ) {
    try {
      const existingTerm = await this.prisma.glossary.findUnique({
        where: { id },
        select: { authorId: true },
      });
      if (!existingTerm) {
        throw new NotFoundException(`Glossary term with ID ${id} not found`);
      }
      if (userRole === Role.AUTHOR && userId && existingTerm.authorId !== userId) {
        throw new ForbiddenException('You can only edit your own glossary terms');
      }

      const processedData = this.processMultilingualFields(updateGlossaryDto);
      const fullTerm = await this.prisma.glossary.findUnique({
        where: { id },
        include: this.includeRelations,
      });

      ['term', 'definition', 'slug'].forEach((field) => {
        if (processedData[field]) {
          processedData[field] = {
            ...(fullTerm[field] as any),
            ...processedData[field],
          };
        }
      });

      return await this.prisma.glossary.update({
        where: { id },
        data: processedData,
        include: {
          ...this.includeRelations,
          author: { select: this.authorSelect },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update glossary term: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string, userRole?: Role) {
    try {
      const existingTerm = await this.prisma.glossary.findUnique({
        where: { id },
        select: { authorId: true },
      });
      if (!existingTerm) {
        throw new NotFoundException(`Glossary term with ID ${id} not found`);
      }
      if (userRole === Role.AUTHOR && userId && existingTerm.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own glossary terms');
      }
      await this.prisma.glossary.delete({ where: { id } });
      return { id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to delete glossary term: ${error.message}`);
      }
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      const glossaryTerm = await this.prisma.glossary.findFirst({
        where: {
          OR: [
            {
              slug: {
                is: {
                  az: {
                    equals: slug,
                  },
                },
              },
            },
            {
              slug: {
                is: {
                  en: {
                    equals: slug,
                  },
                },
              },
            },
          ],
          published: true,
        },
        include: {
          ...this.includeRelations,
          author: { select: this.authorSelect },
        },
      });

      if (!glossaryTerm) {
        throw new NotFoundException(
          `Glossary term with slug ${slug} not found`,
        );
      }

      const manualRelatedIds = (glossaryTerm.relatedTerms as string[] | null) ?? [];
      const relatedTermsData =
        manualRelatedIds.length > 0
          ? await this.prisma.glossary.findMany({
              where: {
                id: {
                  in: manualRelatedIds,
                },
                published: true,
              },
              select: {
                id: true,
                term: true,
                slug: true,
              },
            })
          : [];

      const termTags = extractAllTagStrings(glossaryTerm.tags);

      let relatedByTagData: any[] = [];
      if (termTags.length > 0) {
        const candidates = await this.prisma.glossary.findMany({
          where: {
            published: true,
            id: { notIn: [glossaryTerm.id, ...manualRelatedIds] },
          },
          select: { id: true, term: true, slug: true, tags: true },
        });
        relatedByTagData = candidates
          .filter((c) => {
            const cTags = extractAllTagStrings(c.tags);
            return cTags.some((t) => termTags.includes(t));
          })
          .slice(0, 8);
      }

      return {
        ...glossaryTerm,
        relatedTermsData,
        relatedByTagData,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByCategory(categoryId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = {
        categoryId,
        published: true,
      };

      const [total, items] = await Promise.all([
        this.prisma.glossary.count({
          where: whereClause,
        }),
        this.prisma.glossary.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: this.includeRelations,
          orderBy: {
            term: {
              az: 'asc',
            },
          },
        }),
      ]);

      return {
        items,
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

  async searchGlossary(
    query: string,
    tag?: string,
    page = 1,
    limit = 10,
    categoryId?: string,
    includeUnpublished = false,
    prioritizeIds: string[] = [],
  ) {
    try {
      const skip = (page - 1) * limit;
      const lowerQuery = query ? query.toLowerCase() : '';
      const lowerTag = tag ? tag.toLowerCase().trim() : '';

      // Simple whereClause - just check published status
      const whereClause: any = includeUnpublished ? {} : { published: true };

      const allItems = await this.prisma.glossary.findMany({
        where: whereClause,
        include: this.includeRelations,
      });

      const filtered = allItems.filter((item) => {
        const allTags = extractAllTagStrings(item.tags);
        const tagMatch = lowerTag
          ? allTags.some((t) => t.includes(lowerTag))
          : true;
        if (!tagMatch) return false;

        if (!lowerQuery) return true;

            const termAz = item.term?.az?.toLowerCase() || '';
            const termEn = item.term?.en?.toLowerCase() || '';
            const defAz = item.definition?.az?.toLowerCase() || '';
            const defEn = item.definition?.en?.toLowerCase() || '';
            const categoryAz = item.category?.name?.az?.toLowerCase() || '';
            const categoryEn = item.category?.name?.en?.toLowerCase() || '';

            return (
              termAz.includes(lowerQuery) ||
              termEn.includes(lowerQuery) ||
              defAz.includes(lowerQuery) ||
              defEn.includes(lowerQuery) ||
              categoryAz.includes(lowerQuery) ||
              categoryEn.includes(lowerQuery) ||
              allTags.some((t) => t.includes(lowerQuery))
            );
          });

      // Sort by priority, category, and alphabetical
      filtered.sort((a, b) => {
        // Priority 1: Selected IDs
        if (prioritizeIds.length > 0) {
          const aPrioritized = prioritizeIds.includes(a.id);
          const bPrioritized = prioritizeIds.includes(b.id);
          if (aPrioritized && !bPrioritized) return -1;
          if (!aPrioritized && bPrioritized) return 1;
        }

        // Priority 2: Same category
        if (categoryId) {
          if (a.categoryId === categoryId && b.categoryId !== categoryId)
            return -1;
          if (a.categoryId !== categoryId && b.categoryId === categoryId)
            return 1;
        }

        // Priority 3: Alphabetical
        return a.term?.az?.localeCompare(b.term?.az || '') || 0;
      });

      const paginated = filtered.slice(skip, skip + limit);

      return {
        items: paginated,
        meta: {
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit),
        },
      };
    } catch (error) {
      console.error('Search query failed:', error);
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
}
