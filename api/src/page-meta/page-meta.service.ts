import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PageMetaService {
  constructor(private prisma: PrismaService) {}

  async findByKeyAndLocale(pageKey: string, locale: string) {
    return this.prisma.pageMeta.findFirst({
      where: { pageKey, locale },
    });
  }

  async findAll(pageKey?: string) {
    const where = pageKey ? { pageKey } : {};
    return this.prisma.pageMeta.findMany({
      where,
      orderBy: [{ pageKey: 'asc' }, { locale: 'asc' }],
    });
  }

  async upsert(
    pageKey: string,
    locale: string,
    data: { title: string; description?: string },
  ) {
    const existing = await this.prisma.pageMeta.findFirst({
      where: { pageKey, locale },
    });
    if (existing) {
      return this.prisma.pageMeta.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          description: data.description ?? null,
        },
      });
    }
    return this.prisma.pageMeta.create({
      data: {
        pageKey,
        locale,
        title: data.title,
        description: data.description ?? null,
      },
    });
  }
}
