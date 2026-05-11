import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import slugify from 'slugify';

type LangBlock = { az: string; en: string };
type SlugBlock = { az: string; en: string };

function normalizeLang(input: unknown): LangBlock {
  if (!input || typeof input !== 'object') {
    return { az: '', en: '' };
  }
  const o = input as Record<string, unknown>;
  return {
    az: typeof o.az === 'string' ? o.az : '',
    en: typeof o.en === 'string' ? o.en : '',
  };
}

function slugFromText(text: string, fallback: string, locale: string): string {
  const t = (text || '').trim();
  const s = t
    ? slugify(t, { lower: true, strict: true, locale })
    : '';
  return s || fallback;
}

function normalizeJobLevel(
  input: unknown,
): { az: string; en: string } | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const o = input as Record<string, unknown>;
  const az = typeof o.az === 'string' ? o.az.trim() : '';
  const en = typeof o.en === 'string' ? o.en.trim() : '';
  if (!az && !en) return undefined;
  return { az: az || en, en: en || az };
}

function normalizeTags(
  input: unknown,
): { az: string[]; en: string[] } | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const obj = input as Record<string, unknown>;
  const az = Array.isArray(obj.az)
    ? obj.az.map((t) => String(t).trim()).filter(Boolean).slice(0, 30)
    : [];
  const en = Array.isArray(obj.en)
    ? obj.en.map((t) => String(t).trim()).filter(Boolean).slice(0, 30)
    : [];
  if (az.length === 0 && en.length === 0) return undefined;
  return { az, en };
}

function parseDeadline(iso?: string): Date | undefined {
  if (!iso || typeof iso !== 'string') return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Böyük `order` əvvəl; eyni dəyərlərdə yeni yaradılan yuxarıda. */
  private sortVacancies<T extends { order?: number | null; createdAt?: Date }>(
    items: T[],
  ): T[] {
    return [...items].sort((a, b) => {
      const orderDiff = Number(b.order ?? 0) - Number(a.order ?? 0);
      if (orderDiff !== 0) return orderDiff;

      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  private buildSlugPair(
    title: LangBlock,
    inputSlug?: { az?: string; en?: string },
  ): SlugBlock {
    const az =
      (inputSlug?.az || '').trim() ||
      slugFromText(title.az, 'vacancy', 'az');
    const en =
      (inputSlug?.en || '').trim() ||
      slugFromText(title.en, 'vacancy', 'en');
    return { az, en };
  }

  private async assertSlugValuesUnique(
    slug: SlugBlock,
    excludeId?: string,
  ): Promise<void> {
    const others = await this.prisma.vacancy.findMany({
      where: excludeId ? { id: { not: excludeId } } : {},
      select: { slug: true },
    });
    const used = new Set<string>();
    for (const o of others) {
      const s = o.slug as SlugBlock;
      if (s.az) used.add(s.az);
      if (s.en) used.add(s.en);
    }
    if (used.has(slug.az) || used.has(slug.en)) {
      throw new ConflictException(
        'Bu slug artıq istifadə olunur; başqa slug seçin və ya başlıqları dəyişin.',
      );
    }
  }

  async create(dto: CreateVacancyDto) {
    const title = normalizeLang(dto.title);
    const description = normalizeLang(dto.description);
    const requirements = dto.requirements
      ? normalizeLang(dto.requirements)
      : { az: '', en: '' };
    const workConditions = dto.workConditions
      ? normalizeLang(dto.workConditions)
      : { az: '', en: '' };

    if (!title.az.trim() || !title.en.trim()) {
      throw new ConflictException('Başlıq hər iki dil üçün məcburidir.');
    }
    if (!description.az.trim() || !description.en.trim()) {
      throw new ConflictException('Təsvir hər iki dil üçün məcburidir.');
    }

    const slug = this.buildSlugPair(title, dto.slug);
    await this.assertSlugValuesUnique(slug);

    const order =
      typeof dto.order === 'number' && Number.isFinite(dto.order)
        ? Math.trunc(dto.order)
        : 0;
    const isActive = dto.isActive !== false;

    const hasReq =
      requirements.az.trim().length > 0 || requirements.en.trim().length > 0;
    const hasWC =
      workConditions.az.trim().length > 0 ||
      workConditions.en.trim().length > 0;

    const jobLevel = normalizeJobLevel(dto.jobLevel);
    const tags = normalizeTags(dto.tags);
    const deadline = parseDeadline(dto.deadline);
    const employmentType = dto.employmentType?.trim() || undefined;

    return this.prisma.vacancy.create({
      data: {
        title,
        description,
        ...(hasReq ? { requirements } : {}),
        ...(hasWC ? { workConditions } : {}),
        slug,
        isActive,
        order,
        ...(jobLevel ? { jobLevel } : {}),
        ...(tags ? { tags } : {}),
        ...(employmentType ? { employmentType } : {}),
        ...(deadline ? { deadline } : {}),
      },
    });
  }

  /** Sayt üçün — yalnız aktiv və deadline-ı keçməmiş */
  async findAllPublic() {
    await this.deactivateExpired();
    const now = new Date();
    const items = await this.prisma.vacancy.findMany({
      where: {
        isActive: true,
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
      orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
    });
    return this.sortVacancies(items);
  }

  /** Sayt üçün tək vakansiya (aktiv, deadline keçməmiş) */
  async findBySlugPublic(slug: string) {
    const now = new Date();
    const items = await this.prisma.vacancy.findMany({
      where: {
        isActive: true,
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
    });
    const row = items.find((v) => {
      const s = v.slug as SlugBlock;
      return s.az === slug || s.en === slug;
    });
    if (!row) {
      throw new NotFoundException('Vakansiya tapılmadı');
    }
    return row;
  }

  /** Deadline keçmiş aktiv vakansiyaları avtomatik deaktiv et */
  async deactivateExpired(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.vacancy.updateMany({
      where: {
        isActive: true,
        deadline: { lt: now },
      },
      data: { isActive: false },
    });
    return result.count;
  }

  async findAllManage(page = 1, limit = 20) {
    // Deadline keçmiş vakansiyaları avtomatik deaktiv et
    await this.deactivateExpired();

    const safePage = Math.max(1, +page || 1);
    const safeLimit = Math.min(100, Math.max(1, +limit || 20));
    const skip = (safePage - 1) * safeLimit;

    const [total, allItems] = await Promise.all([
      this.prisma.vacancy.count(),
      this.prisma.vacancy.findMany({
        orderBy: [{ order: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);
    const items = this.sortVacancies(allItems).slice(skip, skip + safeLimit);

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
    const item = await this.prisma.vacancy.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Vakansiya tapılmadı: ${id}`);
    }
    return item;
  }

  async update(id: string, dto: UpdateVacancyDto) {
    const existing = await this.findOne(id);
    const curSlug = existing.slug as SlugBlock;
    const nextTitle =
      dto.title !== undefined
        ? normalizeLang(dto.title)
        : (existing.title as LangBlock);
    const nextDesc =
      dto.description !== undefined
        ? normalizeLang(dto.description)
        : (existing.description as LangBlock);
    const nextReq =
      dto.requirements !== undefined
        ? normalizeLang(dto.requirements)
        : ((existing.requirements as LangBlock | null) ?? { az: '', en: '' });
    const nextWC =
      dto.workConditions !== undefined
        ? normalizeLang(dto.workConditions)
        : (((existing as any).workConditions as LangBlock | null) ?? {
            az: '',
            en: '',
          });

    if (dto.title !== undefined) {
      if (!nextTitle.az.trim() || !nextTitle.en.trim()) {
        throw new ConflictException('Başlıq hər iki dil üçün məcburidir.');
      }
    }
    if (dto.description !== undefined) {
      if (!nextDesc.az.trim() || !nextDesc.en.trim()) {
        throw new ConflictException('Təsvir hər iki dil üçün məcburidir.');
      }
    }

    let newSlug = curSlug;
    if (dto.slug !== undefined) {
      newSlug = this.buildSlugPair(nextTitle, {
        az: dto.slug.az !== undefined ? dto.slug.az : curSlug.az,
        en: dto.slug.en !== undefined ? dto.slug.en : curSlug.en,
      });
    }

    const data: {
      title?: LangBlock;
      description?: LangBlock;
      requirements?: LangBlock | null;
      workConditions?: LangBlock | null;
      slug?: SlugBlock;
      isActive?: boolean;
      order?: number;
      jobLevel?: { az: string; en: string } | null;
      tags?: { az: string[]; en: string[] } | null;
      employmentType?: string | null;
      deadline?: Date | null;
    } = {};

    if (dto.title !== undefined) data.title = nextTitle;
    if (dto.description !== undefined) data.description = nextDesc;
    if (dto.requirements !== undefined) {
      const hasReq =
        nextReq.az.trim().length > 0 || nextReq.en.trim().length > 0;
      data.requirements = hasReq ? nextReq : null;
    }
    if (dto.workConditions !== undefined) {
      const hasWC =
        nextWC.az.trim().length > 0 || nextWC.en.trim().length > 0;
      data.workConditions = hasWC ? nextWC : null;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.order !== undefined && Number.isFinite(dto.order)) {
      data.order = Math.trunc(dto.order);
    }
    if (dto.jobLevel !== undefined) {
      const jl = normalizeJobLevel(dto.jobLevel);
      data.jobLevel = jl ?? null;
    }
    if (dto.tags !== undefined) {
      data.tags = normalizeTags(dto.tags) ?? null;
    }
    if (dto.employmentType !== undefined) {
      data.employmentType = dto.employmentType?.trim() || null;
    }
    if (dto.deadline !== undefined) {
      const d = parseDeadline(dto.deadline);
      data.deadline = d ?? null;
    }

    const slugChanged =
      newSlug.az !== curSlug.az || newSlug.en !== curSlug.en;
    if (dto.slug !== undefined && slugChanged) {
      await this.assertSlugValuesUnique(newSlug, id);
      data.slug = newSlug;
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    return this.prisma.vacancy.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vacancy.delete({ where: { id } });
  }
}
