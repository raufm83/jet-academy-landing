import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateGraduateDto } from './dto/create-graduate.dto';
import { UpdateGraduateDto } from './dto/update-graduate.dto';

type LangBlock = { az: string; en: string };

function normalizeLang(input: unknown): LangBlock {
  if (!input || typeof input !== 'object') return { az: '', en: '' };
  const o = input as Record<string, unknown>;
  return {
    az: typeof o.az === 'string' ? o.az : '',
    en: typeof o.en === 'string' ? o.en : '',
  };
}

@Injectable()
export class GraduateService {
  private readonly uploadDir = 'uploads-acad';
  private readonly imageDir = 'graduates';

  constructor(private readonly prisma: PrismaService) {}

  private getRelativeImagePath(filename: string): string {
    return path.join(this.imageDir, filename);
  }

  private getAbsoluteImagePath(filename: string): string {
    return path.join(process.cwd(), this.uploadDir, this.imageDir, filename);
  }

  private async resolveCourseName(
    courseId?: string | null,
  ): Promise<{ az: string; en: string } | null> {
    if (!courseId) return null;
    try {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      });
      if (!course?.title) return null;
      const t = course.title as Record<string, unknown>;
      return {
        az: typeof t.az === 'string' ? t.az : '',
        en: typeof t.en === 'string' ? t.en : '',
      };
    } catch {
      return null;
    }
  }

  async create(dto: CreateGraduateDto, imageFilename?: string) {
    const name = normalizeLang(dto.name);
    const story = normalizeLang(dto.story);
    const mediaType = dto.mediaType === 'youtube' ? 'youtube' : 'image';

    let mediaUrl = '';
    if (mediaType === 'youtube') {
      mediaUrl = typeof dto.mediaUrl === 'string' ? dto.mediaUrl.trim() : '';
    } else if (imageFilename) {
      mediaUrl = this.getRelativeImagePath(imageFilename);
    }

    const totalItems = await this.prisma.graduate.count();
    const order =
      typeof dto.order === 'number' && Number.isFinite(dto.order)
        ? Math.trunc(dto.order)
        : totalItems;
    const isActive = dto.isActive !== false;

    const courseId = dto.courseId || null;
    const courseName = await this.resolveCourseName(courseId);

    return this.prisma.graduate.create({
      data: {
        name,
        story,
        mediaType,
        mediaUrl,
        isActive,
        order,
        courseId,
        courseName,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.graduate.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAllManage(page = 1, limit = 20) {
    const safePage = Math.max(1, +page || 1);
    const safeLimit = Math.min(100, Math.max(1, +limit || 20));
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      this.prisma.graduate.count(),
      this.prisma.graduate.findMany({
        skip,
        take: safeLimit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 0,
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.graduate.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Məzun tapılmadı: ${id}`);
    return item;
  }

  async update(id: string, dto: UpdateGraduateDto, imageFilename?: string) {
    const existing = await this.findOne(id);

    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = normalizeLang(dto.name);
    if (dto.story !== undefined) data.story = normalizeLang(dto.story);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.order !== undefined && Number.isFinite(+dto.order)) {
      data.order = Math.trunc(+dto.order);
    }

    if (dto.courseId !== undefined) {
      const cid = dto.courseId || null;
      data.courseId = cid;
      data.courseName = await this.resolveCourseName(cid);
    }

    if (dto.mediaType !== undefined) {
      data.mediaType = dto.mediaType === 'youtube' ? 'youtube' : 'image';
    }

    const effectiveMediaType =
      (data.mediaType as string) || existing.mediaType;

    if (effectiveMediaType === 'youtube' && dto.mediaUrl !== undefined) {
      data.mediaUrl =
        typeof dto.mediaUrl === 'string' ? dto.mediaUrl.trim() : '';
      if (existing.mediaType === 'image' && existing.mediaUrl) {
        await this.cleanupImage(existing.mediaUrl);
      }
    } else if (imageFilename) {
      const oldUrl = existing.mediaUrl;
      data.mediaUrl = this.getRelativeImagePath(imageFilename);
      if (existing.mediaType === 'image' && oldUrl) {
        await this.cleanupImage(oldUrl);
      }
    }

    if (Object.keys(data).length === 0) return existing;

    return this.prisma.graduate.update({ where: { id }, data });
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.prisma.graduate.delete({ where: { id } });
    if (item.mediaType === 'image' && item.mediaUrl) {
      await this.cleanupImage(item.mediaUrl);
    }
    return { id };
  }

  private async cleanupImage(relativeUrl: string) {
    if (!relativeUrl) return;
    try {
      const filename = relativeUrl.replace(`${this.imageDir}/`, '');
      const abs = this.getAbsoluteImagePath(filename);
      await fs.access(abs);
      await fs.unlink(abs);
    } catch {}
  }
}
