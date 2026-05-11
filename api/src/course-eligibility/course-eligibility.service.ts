import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { jsonBilingualContains } from 'src/common/json-bilingual-search';
import { CreateCourseEligibilityDto } from './dto/create-course-eligibility.dto';
import { UpdateCourseEligibilityDto } from './dto/update-course-eligibility.dto';

@Injectable()
export class CourseEligibilityService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseEligibilityDto: CreateCourseEligibilityDto) {
    try {
      let order = createCourseEligibilityDto.order;
      if (order === undefined || order === null) {
        const agg = await this.prisma.courseEligibility.aggregate({
          _max: { order: true },
        });
        order = (agg._max.order ?? 0) + 1;
      }
      return await this.prisma.courseEligibility.create({
        data: {
          title: createCourseEligibilityDto.title as Prisma.InputJsonValue,
          description:
            createCourseEligibilityDto.description as Prisma.InputJsonValue,
          icon: createCourseEligibilityDto.icon,
          order: Number(order) || 0,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to create course eligibility: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    courseId?: string,
    search?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      /**
       * courseId === 'unassigned' → heç bir kursa bağlanmayan tələblər.
       * courseId=<id> → həmin kursa bağlanan tələblər.
       * search → title.az / title.en üzrə axtarış.
       */
      const where: Prisma.CourseEligibilityWhereInput = {};

      if (courseId && courseId !== 'all') {
        if (courseId === 'unassigned') {
          where.courses = { none: {} };
        } else {
          where.courses = { some: { courseId } };
        }
      }

      const include = {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      } as const;

      if (search && search.trim()) {
        const q = search.trim();
        const list = await this.prisma.courseEligibility.findMany({
          where,
          include,
        });
        const filtered = list
          .filter(
            (e) =>
              jsonBilingualContains(e.title, q) ||
              jsonBilingualContains(e.description, q),
          )
          .sort((a, b) => {
            const od =
              Number(b.order ?? 0) - Number(a.order ?? 0);
            if (od !== 0) return od;
            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          });
        const total = filtered.length;
        const items = filtered.slice(skip, skip + limit);
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
        this.prisma.courseEligibility.count({ where }),
        this.prisma.courseEligibility.findMany({
          where,
          skip,
          take: limit,
          include,
          orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Database query failed:', error);
      }
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
    try {
      const eligibility = await this.prisma.courseEligibility.findUnique({
        where: { id },
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!eligibility) {
        throw new NotFoundException(
          `Course eligibility with ID ${id} not found`,
        );
      }

      return eligibility;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to fetch course eligibility: ${error.message}`);
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateCourseEligibilityDto: UpdateCourseEligibilityDto,
  ) {
    try {
      await this.findOne(id);

      /**
       * `CourseEligibility` modelinə aid olmayan əlavə sahələr Prisma error-u
       * yaratmasın deyə yalnız icazə verilən sahələri seçirik.
       */
      const data: {
        title?: unknown;
        description?: unknown;
        icon?: string;
        order?: number;
      } = {};
      if (updateCourseEligibilityDto.title !== undefined) {
        data.title = updateCourseEligibilityDto.title;
      }
      if (updateCourseEligibilityDto.description !== undefined) {
        data.description = updateCourseEligibilityDto.description;
      }
      if (updateCourseEligibilityDto.icon !== undefined) {
        data.icon = updateCourseEligibilityDto.icon;
      }
      if (updateCourseEligibilityDto.order !== undefined) {
        data.order = Number(updateCourseEligibilityDto.order) || 0;
      }

      return await this.prisma.courseEligibility.update({
        where: { id },
        data: data as any,
        include: {
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to update course eligibility: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const eligibility = await this.findOne(id);

      await this.prisma.courseEligibility.delete({
        where: { id },
      });

      return eligibility;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to delete course eligibility: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async addToCourse(eligibilityId: string, courseId: string, order = 0) {
    try {
      return await this.prisma.courseToEligibility.create({
        data: {
          courseId,
          eligibilityId,
          order: Number(order) || 0,
        },
        include: {
          course: true,
          eligibility: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('This eligibility is already assigned to the course');
        }
        throw new Error(
          `Failed to add eligibility to course: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateCourseOrder(
    eligibilityId: string,
    courseId: string,
    order = 0,
  ) {
    try {
      return await this.prisma.courseToEligibility.update({
        where: {
          courseId_eligibilityId: {
            courseId,
            eligibilityId,
          },
        },
        data: {
          order: Number(order) || 0,
        },
        include: {
          course: true,
          eligibility: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to update eligibility order: ${error.message}`,
        );
      }
      throw error;
    }
  }

  /** Global tələb şablonlarının sırası (admin cədvəli). Böyük order yuxarıda. */
  async reorder(items: Array<{ id: string; order: number }>) {
    if (!Array.isArray(items) || items.length === 0) {
      return { updated: 0 };
    }
    const results = await Promise.all(
      items.map((it) =>
        this.prisma.courseEligibility
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

  async removeFromCourse(eligibilityId: string, courseId: string) {
    try {
      return await this.prisma.courseToEligibility.delete({
        where: {
          courseId_eligibilityId: {
            courseId,
            eligibilityId,
          },
        },
        include: {
          course: true,
          eligibility: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to remove eligibility from course: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
