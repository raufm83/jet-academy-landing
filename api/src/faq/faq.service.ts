import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';

type LangBlock = { az: string; en: string };

function normalizeMultilingual(input: unknown): LangBlock {
  if (!input || typeof input !== 'object') {
    return { az: '', en: '' };
  }
  const o = input as Record<string, unknown>;
  return {
    az: typeof o.az === 'string' ? o.az : '',
    en: typeof o.en === 'string' ? o.en : '',
  };
}

function normalizePages(input: unknown): string[] {
  if (!input) return [];
  if (typeof input === 'string') return input.trim() ? [input.trim()] : [];
  if (Array.isArray(input)) {
    return input
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
  }
  return [];
}

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFaqItemDto) {
    const question = normalizeMultilingual(dto.question);
    const answer = normalizeMultilingual(dto.answer);
    const pages = normalizePages(dto.pages);

    let order: number;
    if (typeof dto.order === 'number' && Number.isFinite(dto.order) && dto.order !== 0) {
      order = Math.trunc(dto.order);
    } else {
      const last = await this.prisma.faqItem.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = last ? last.order + 1 : 0;
    }

    return this.prisma.faqItem.create({
      data: {
        question,
        answer,
        order,
        pages,
      },
    });
  }

  async findAll(page = 1, limit = 20, pageKeyFilter?: string) {
    const safePage = Math.max(1, +page || 1);
    const safeLimit = Math.min(100, Math.max(1, +limit || 20));
    const skip = (safePage - 1) * safeLimit;

    const where = pageKeyFilter?.trim()
      ? { pages: { hasSome: [pageKeyFilter.trim()] } }
      : {};

    const [total, items] = await Promise.all([
      this.prisma.faqItem.count({ where }),
      this.prisma.faqItem.findMany({
        where,
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
    const item = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`FAQ elementi tapılmadı: ${id}`);
    }
    return item;
  }

  async update(id: string, dto: UpdateFaqItemDto) {
    await this.findOne(id);

    const data: {
      question?: LangBlock;
      answer?: LangBlock;
      order?: number;
      pages?: string[];
    } = {};

    if (dto.question !== undefined) {
      data.question = normalizeMultilingual(dto.question);
    }
    if (dto.answer !== undefined) {
      data.answer = normalizeMultilingual(dto.answer);
    }
    if (dto.order !== undefined && Number.isFinite(dto.order)) {
      data.order = Math.trunc(dto.order);
    }
    if (dto.pages !== undefined) {
      data.pages = normalizePages(dto.pages);
    }

    if (Object.keys(data).length === 0) {
      return this.findOne(id);
    }

    return this.prisma.faqItem.update({
      where: { id },
      data,
    });
  }

  async findByPage(pageKey: string) {
    return this.prisma.faqItem.findMany({
      where: { pages: { hasSome: [pageKey] } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faqItem.delete({ where: { id } });
  }
}
