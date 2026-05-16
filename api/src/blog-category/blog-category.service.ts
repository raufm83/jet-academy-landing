import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';

@Injectable()
export class BlogCategoryService {
  constructor(private prisma: PrismaService) {}

  private processNameFields(dto: any) {
    const processedData: any = { ...dto };
    const result: any = {};
    if (dto['name[az]'] != null || dto['name[en]'] != null) {
      result.name = {
        az: String(dto['name[az]'] ?? '').trim(),
        en: String(dto['name[en]'] ?? '').trim(),
      };
      delete processedData['name[az]'];
      delete processedData['name[en]'];
    }
    return { ...processedData, ...result };
  }

  async create(dto: CreateBlogCategoryDto) {
    const processed = this.processNameFields(dto);
    if (!processed.name?.az) {
      throw new BadRequestException('name[az] is required');
    }
    const agg = await this.prisma.blogCategory.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder =
      processed.sortOrder ?? (agg._max.sortOrder ?? -1) + 1;
    try {
      return await this.prisma.blogCategory.create({
        data: {
          name: processed.name,
          sortOrder: nextOrder,
        },
        include: {
          _count: { select: { posts: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to create blog category: ${error.message}`);
      }
      throw error;
    }
  }

  async findAllOrdered() {
    try {
      return await this.prisma.blogCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { posts: true } },
        },
      });
    } catch (error) {
      console.error('Database query failed:', error);
      return [];
    }
  }

  async findOne(id: string) {
    const row = await this.prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!row) {
      throw new NotFoundException(`Blog category with ID ${id} not found`);
    }
    return row;
  }

  async update(id: string, dto: UpdateBlogCategoryDto) {
    const existing = await this.findOne(id);
    const processed = this.processNameFields(dto);
    if (processed.name && existing.name) {
      processed.name = {
        ...((existing.name as { az?: string; en?: string }) || {}),
        ...processed.name,
      };
    }
    try {
      return await this.prisma.blogCategory.update({
        where: { id },
        data: processed,
        include: { _count: { select: { posts: true } } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Failed to update blog category: ${error.message}`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.blogCategory.delete({ where: { id } });
    return { id };
  }
}
