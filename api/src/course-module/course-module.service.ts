import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { jsonBilingualContains } from 'src/common/json-bilingual-search';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import {
  AssignModuleDto,
  UpdateCourseModuleDto,
} from './dto/update-course-module.dto';

@Injectable()
export class CourseModuleService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseModuleDto: CreateCourseModuleDto) {
    try {
      const { title, description, content } = createCourseModuleDto;

      return await this.prisma.courseModule.create({
        data: {
          title,
          description,
          content,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create course module: ${error.message}`);
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
       * courseId === 'unassigned' → heç bir kursa bağlanmayan modullar.
       * courseId=<id> → həmin kursa bağlanan modullar.
       * search → title.az / title.en üzrə axtarış.
       */
      const where: Prisma.CourseModuleWhereInput = {};

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
        const list = await this.prisma.courseModule.findMany({
          where,
          include,
        });
        const filtered = list.filter(
          (m) =>
            jsonBilingualContains(m.title, q) ||
            jsonBilingualContains(m.description, q),
        );
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
        this.prisma.courseModule.count({ where }),
        this.prisma.courseModule.findMany({
          where,
          skip,
          take: limit,
          include,
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
      const module = await this.prisma.courseModule.findUnique({
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

      if (!module) {
        throw new NotFoundException(`Course module with ID ${id} not found`);
      }

      return module;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to fetch course module: ${error.message}`);
      }
      throw error;
    }
  }

  async update(id: string, updateCourseModuleDto: UpdateCourseModuleDto) {
    try {
      await this.findOne(id);

      /**
       * Yalnız `CourseModule` modelinə aid sahələri Prisma-ya ötürürük ki,
       * frontend-dən təsadüfən gələn `id`, `createdAt`, `courses` kimi əlavə
       * sahələr Prisma error-u yaratmasın.
       */
      const data: {
        title?: unknown;
        description?: unknown;
        content?: unknown;
      } = {};
      if (updateCourseModuleDto.title !== undefined) {
        data.title = updateCourseModuleDto.title;
      }
      if (updateCourseModuleDto.description !== undefined) {
        data.description = updateCourseModuleDto.description;
      }
      if (updateCourseModuleDto.content !== undefined) {
        data.content = updateCourseModuleDto.content;
      }

      return await this.prisma.courseModule.update({
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
        throw new Error(`Failed to update course module: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const module = await this.findOne(id);

      await this.prisma.courseModule.delete({
        where: { id },
      });

      return module;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to delete course module: ${error.message}`);
      }
      throw error;
    }
  }

  async assignToCourse(courseId: string, { moduleId, order }: AssignModuleDto) {
    try {
      const [course, module] = await Promise.all([
        this.prisma.course.findUnique({ where: { id: courseId } }),
        this.prisma.courseModule.findUnique({ where: { id: moduleId } }),
      ]);

      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      if (!module) {
        throw new NotFoundException(`Module with ID ${moduleId} not found`);
      }

      await this.prisma.$transaction(async (prisma) => {
        await prisma.courseToModule.updateMany({
          where: {
            courseId,
            order: {
              gte: order,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });

        return await prisma.courseToModule.create({
          data: {
            courseId,
            moduleId,
            order,
          },
        });
      });

      return this.findOne(moduleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('This module is already assigned to the course');
        }
        throw new Error(`Failed to assign module to course: ${error.message}`);
      }
      throw error;
    }
  }

  async removeFromCourse(courseId: string, moduleId: string) {
    try {
      const assignment = await this.prisma.courseToModule.findUnique({
        where: {
          courseId_moduleId: {
            courseId,
            moduleId,
          },
        },
      });

      if (!assignment) {
        throw new NotFoundException(`Module assignment not found`);
      }

      await this.prisma.$transaction([
        this.prisma.courseToModule.delete({
          where: {
            courseId_moduleId: {
              courseId,
              moduleId,
            },
          },
        }),
        this.prisma.courseToModule.updateMany({
          where: {
            courseId,
            order: {
              gt: assignment.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        }),
      ]);

      return this.findOne(moduleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(
          `Failed to remove module from course: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateModuleOrder(
    courseId: string,
    moduleId: string,
    newOrder: number,
  ) {
    try {
      const assignment = await this.prisma.courseToModule.findUnique({
        where: {
          courseId_moduleId: {
            courseId,
            moduleId,
          },
        },
      });

      if (!assignment) {
        throw new NotFoundException(`Module assignment not found`);
      }

      if (assignment.order === newOrder) {
        return this.findOne(moduleId);
      }

      await this.prisma.$transaction(async (prisma) => {
        if (newOrder > assignment.order) {
          await prisma.courseToModule.updateMany({
            where: {
              courseId,
              order: {
                gt: assignment.order,
                lte: newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        } else {
          await prisma.courseToModule.updateMany({
            where: {
              courseId,
              order: {
                gte: newOrder,
                lt: assignment.order,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        }

        await prisma.courseToModule.update({
          where: {
            courseId_moduleId: {
              courseId,
              moduleId,
            },
          },
          data: {
            order: newOrder,
          },
        });
      });

      return this.findOne(moduleId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update module order: ${error.message}`);
      }
      throw error;
    }
  }
}
