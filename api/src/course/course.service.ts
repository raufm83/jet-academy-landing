import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  /** Köhnə qeydlərdə imageUrl bəzən .../api/uploads/... (yanlış) saxlanılıb. */
  private normalizeCourseImageUrl<T extends { imageUrl?: string | null }>(
    course: T,
  ): T {
    const raw = course?.imageUrl;
    if (typeof raw !== 'string' || !raw) return course;
    const fixed = raw.replace(
      /^(https?:\/\/[^/]+)\/api(\/uploads\/)/i,
      '$1$2',
    );
    if (fixed === raw) return course;
    return { ...course, imageUrl: fixed };
  }

  private processMultilingualFields(dto: any) {
    const multilingualFields = [
      'title',
      'description',
      'shortDescription',
      'slug',
      'level',
      'newTags',
    ];
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

    if (
      processedData.duration !== undefined &&
      processedData.duration !== null &&
      processedData.duration !== ''
    ) {
      const parsed = parseFloat(processedData.duration.toString());
      if (!Number.isNaN(parsed)) {
        processedData.duration = parsed;
      }
    }

    if (processedData.published !== undefined) {
      processedData.published =
        processedData.published === 'true' || processedData.published === true;
    }

    if (
      processedData.order !== undefined &&
      processedData.order !== null &&
      processedData.order !== ''
    ) {
      const parsedOrder = parseInt(processedData.order.toString(), 10);
      if (!Number.isNaN(parsedOrder)) {
        processedData.order = parsedOrder;
      } else {
        delete processedData.order;
      }
    }

    return { ...processedData, ...result };
  }

  private readonly includeRelations = {
    modules: {
      include: {
        module: true,
      },
      orderBy: {
        order: Prisma.SortOrder.asc,
      },
    },
    teachers: {
      include: {
        teacher: true,
        courseTeacher: true,
      },
    },
    eligibility: {
      include: {
        eligibility: true,
      },
      orderBy: {
        order: Prisma.SortOrder.desc,
      },
    },
  };

  async create(createCourseDto: CreateCourseDto) {
    try {
      const processedData = this.processMultilingualFields(createCourseDto);

      return await this.prisma.course.create({
        data: processedData,
        include: this.includeRelations,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create course: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Böyük `order` əvvəl (yuxarıda).
   * Qeyd: MongoDB + Prisma-da `[order, createdAt]` birləşik orderBy bəzən yalnız ikinci sahəni tətbiq edir;
   * ona görə əvvəlcə yalnız `order` ilə sıralayırıq, eyni dəyərləri burada ardıcıllıqla möhkəmləndiririk.
   */
  private buildOrderBy(_sortOrder?: string): Prisma.CourseOrderByWithRelationInput {
    return { order: Prisma.SortOrder.desc };
  }

  /** Eyni `order` dəyəri olan kurslar üçün ikinci dərəcəli sıra (yalnız siyahı üzərində). */
  private tieBreakCourses<T extends { order?: number | null; createdAt?: Date }>(
    items: T[],
    sortOrder?: string,
  ): T[] {
    const createdDir =
      sortOrder === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
      const oa = Number(a.order ?? 0);
      const ob = Number(b.order ?? 0);
      if (ob !== oa) return ob - oa;
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (ta - tb) * createdDir;
    });
  }

  async findAll(
    page = 1,
    limit = 10,
    includeUnpublished = false,
    sortOrder?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = includeUnpublished ? {} : { published: true };
      const orderBy = this.buildOrderBy(sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.course.count({
          where: whereClause,
        }),
        this.prisma.course.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
          include: this.includeRelations,
        }),
      ]);

      return {
        items: this.tieBreakCourses(items, sortOrder),
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

  async findAllBrief(
    limit = 10,
    includeUnpublished = false,
    page = 1,
    sortOrder?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const whereClause = includeUnpublished ? {} : { published: true };
      const orderBy = this.buildOrderBy(sortOrder);

      const [total, items] = await Promise.all([
        this.prisma.course.count({
          where: whereClause,
        }),
        this.prisma.course.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            duration: true,
            icon: true,
            published: true,
            imageUrl: true,
            ageRange: true,
            newTags: true,
            tag: true,
            order: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        items: this.tieBreakCourses(items, sortOrder),
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
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const existingCourse = await this.findOne(id);
      const processedData = this.processMultilingualFields(updateCourseDto);

      [
        'title',
        'description',
        'shortDescription',
        'slug',
        'level',
        'newTags',
      ].forEach((field) => {
        if (processedData[field]) {
          processedData[field] = {
            ...(existingCourse[field] as any),
            ...processedData[field],
          };
        }
      });

      return await this.prisma.course.update({
        where: { id },
        data: processedData,
        include: this.includeRelations,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update course: ${error.message}`);
      }
      throw error;
    }
  }

  /** Adminin drag-and-drop ilə yenilədiyi sıralamanı yadda saxlayır. */
  async reorder(items: Array<{ id: string; order: number }>) {
    if (!Array.isArray(items) || items.length === 0) {
      return { updated: 0 };
    }
    const results = await Promise.all(
      items.map((it) =>
        this.prisma.course
          .update({
            where: { id: it.id },
            data: { order: Number(it.order) || 0 },
            select: { id: true, order: true },
          })
          .catch(() => null),
      ),
    );
    return {
      updated: results.filter(Boolean).length,
      items: results.filter(Boolean),
    };
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.prisma.course.delete({ where: { id } });
      return { id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to delete course: ${error.message}`);
      }
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      const courses = await this.prisma.course.findMany({
        include: this.includeRelations,
      });

      const course = courses.find((course) => {
        const slugData = course.slug as any;
        return slugData?.az === slug || slugData?.en === slug;
      });

      if (!course) {
        throw new NotFoundException(`Course with slug ${slug} not found`);
      }

      return this.normalizeCourseImageUrl(course);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find course by slug: ${error.message}`);
    }
  }
}
