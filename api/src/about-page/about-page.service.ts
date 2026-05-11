import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import { UpdateAboutPageDto } from './dto/update-about-page.dto';

export type LocalesJson = { az: string; en: string };

@Injectable()
export class AboutPageService {
  private readonly uploadDir = 'uploads-acad';
  private readonly imageSubdir = 'about-page';

  constructor(private readonly prisma: PrismaService) {}

  private emptyLocales(): LocalesJson {
    return { az: '', en: '' };
  }

  private asLocales(input: unknown): LocalesJson {
    if (!input || typeof input !== 'object') return this.emptyLocales();
    const o = input as Record<string, unknown>;
    return {
      az: String(o.az ?? '').trim(),
      en: String(o.en ?? '').trim(),
    };
  }

  private normalizeLocales(
    input?: { az?: string; en?: string } | null,
  ): LocalesJson {
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
    const row = await this.prisma.aboutPageContent.findFirst();
    if (!row) return null;
    return {
      introTitle: this.asLocales(row.introTitle),
      introDescription1: this.asLocales(row.introDescription1),
      introDescription2: this.asLocales(row.introDescription2),
      introDescription3: this.asLocales(row.introDescription3),
      introImageUrl: row.introImageUrl,
      introImageAlt: this.asLocales(row.introImageAlt),
      missionSectionTitle: this.asLocales(row.missionSectionTitle),
      missionTitle: this.asLocales(row.missionTitle),
      missionDescription: this.asLocales(row.missionDescription),
      visionTitle: this.asLocales(row.visionTitle),
      visionDescription: this.asLocales(row.visionDescription),
      missionVisionImageUrl: row.missionVisionImageUrl,
      missionVisionImageAlt: this.asLocales(row.missionVisionImageAlt),
    };
  }

  async ensureForAdmin() {
    let row = await this.prisma.aboutPageContent.findFirst();
    if (!row) {
      row = await this.prisma.aboutPageContent.create({
        data: {},
      });
      return row;
    }
    return row;
  }

  async update(dto: UpdateAboutPageDto) {
    const current = await this.ensureForAdmin();

    const data: Record<string, unknown> = {};

    if (dto.introTitle) data.introTitle = this.normalizeLocales(dto.introTitle);
    if (dto.introDescription1)
      data.introDescription1 = this.normalizeLocales(dto.introDescription1);
    if (dto.introDescription2)
      data.introDescription2 = this.normalizeLocales(dto.introDescription2);
    if (dto.introDescription3)
      data.introDescription3 = this.normalizeLocales(dto.introDescription3);
    if (dto.introImageAlt)
      data.introImageAlt = this.normalizeLocales(dto.introImageAlt);
    if (dto.missionSectionTitle)
      data.missionSectionTitle = this.normalizeLocales(dto.missionSectionTitle);
    if (dto.missionTitle)
      data.missionTitle = this.normalizeLocales(dto.missionTitle);
    if (dto.missionDescription)
      data.missionDescription = this.normalizeLocales(dto.missionDescription);
    if (dto.visionTitle)
      data.visionTitle = this.normalizeLocales(dto.visionTitle);
    if (dto.visionDescription)
      data.visionDescription = this.normalizeLocales(dto.visionDescription);
    if (dto.missionVisionImageAlt)
      data.missionVisionImageAlt = this.normalizeLocales(
        dto.missionVisionImageAlt,
      );

    if (Object.keys(data).length === 0) {
      return current;
    }

    return this.prisma.aboutPageContent.update({
      where: { id: current.id },
      data: data as any,
    });
  }

  private applyFilename(filename: string | null): string | null {
    return filename ? `${this.imageSubdir}/${filename}` : null;
  }

  async saveIntroImage(filename: string | null) {
    const rel = this.applyFilename(filename);
    if (!rel) {
      throw new BadRequestException('Şəkil faylı seçilməyib.');
    }
    const current = await this.ensureForAdmin();
    const old = current.introImageUrl;
    const updated = await this.prisma.aboutPageContent.update({
      where: { id: current.id },
      data: { introImageUrl: rel },
    });
    if (old && old !== rel) await this.cleanupImage(old);
    return updated;
  }

  async saveMissionVisionImage(filename: string | null) {
    const rel = this.applyFilename(filename);
    if (!rel) {
      throw new BadRequestException('Şəkil faylı seçilməyib.');
    }
    const current = await this.ensureForAdmin();
    const old = current.missionVisionImageUrl;
    const updated = await this.prisma.aboutPageContent.update({
      where: { id: current.id },
      data: { missionVisionImageUrl: rel },
    });
    if (old && old !== rel) await this.cleanupImage(old);
    return updated;
  }
}
