import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import { UpdateHomeHeroDto } from './dto/update-home-hero.dto';

export type HeroLocalesJson = {
  az: string;
  en: string;
};

@Injectable()
export class HomeHeroService {
  private readonly uploadDir = 'uploads-acad';
  private readonly imageSubdir = 'home-hero';

  constructor(private readonly prisma: PrismaService) {}

  private emptyLocales(): HeroLocalesJson {
    return { az: '', en: '' };
  }

  private asLocales(input: unknown): HeroLocalesJson {
    if (!input || typeof input !== 'object') return this.emptyLocales();
    const o = input as Record<string, unknown>;
    return {
      az: String(o.az ?? '').trim(),
      en: String(o.en ?? '').trim(),
    };
  }

  private normalizeLocales(
    input?: { az?: string; en?: string } | null,
  ): HeroLocalesJson {
    if (!input || typeof input !== 'object') return this.emptyLocales();
    return {
      az: String(input.az ?? '').trim(),
      en: String(input.en ?? '').trim(),
    };
  }

  private getAbsoluteImagePath(relative: string): string {
    const rel = relative.replace(/^\/+/, '').replace(/\//g, path.sep);
    return path.join(process.cwd(), this.uploadDir, rel);
  }

  private async cleanupImage(relativePath: string | null | undefined) {
    if (!relativePath || !String(relativePath).trim()) return;
    const abs = this.getAbsoluteImagePath(String(relativePath));
    try {
      await fs.unlink(abs);
    } catch {
      /* noSuchFile */
    }
  }

  async findPublic() {
    const row = await this.prisma.homeHero.findFirst({
      select: {
        contentHtml: true,
        imageAlt: true,
        imageUrl: true,
      },
    });
    if (!row) return null;
    return {
      contentHtml: this.asLocales(row.contentHtml),
      imageAlt: this.asLocales(row.imageAlt),
      imageUrl: row.imageUrl,
    };
  }

  async ensureForAdmin() {
    let row = await this.prisma.homeHero.findFirst();
    if (!row) {
      row = await this.prisma.homeHero.create({
        data: {
          contentHtml: this.emptyLocales(),
          imageAlt: this.emptyLocales(),
          imageUrl: null,
        },
      });
      return row;
    }
    if (row.contentHtml == null || row.imageAlt == null) {
      row = await this.prisma.homeHero.update({
        where: { id: row.id },
        data: {
          contentHtml: this.asLocales(row.contentHtml),
          imageAlt: this.asLocales(row.imageAlt),
        },
      });
    }
    return row;
  }

  async update(dto: UpdateHomeHeroDto) {
    const current = await this.ensureForAdmin();

    const data: {
      contentHtml?: HeroLocalesJson;
      imageAlt?: HeroLocalesJson;
    } = {};

    if (dto.contentHtml) {
      data.contentHtml = this.normalizeLocales(dto.contentHtml);
    }
    if (dto.imageAlt) {
      data.imageAlt = this.normalizeLocales(dto.imageAlt);
    }

    if (Object.keys(data).length === 0) {
      return current;
    }

    return this.prisma.homeHero.update({
      where: { id: current.id },
      data,
    });
  }

  applyUploadedFilename(filename: string | null): string | null {
    return filename ? `${this.imageSubdir}/${filename}` : null;
  }

  async saveUploadedImage(filename: string | null) {
    const rel = this.applyUploadedFilename(filename);
    if (!rel) {
      throw new BadRequestException('Şəkil faylı seçilməyib.');
    }
    const current = await this.ensureForAdmin();
    const oldImage = current.imageUrl;
    const updated = await this.prisma.homeHero.update({
      where: { id: current.id },
      data: { imageUrl: rel },
    });
    if (oldImage && oldImage !== rel) {
      await this.cleanupImage(oldImage);
    }
    return updated;
  }
}
