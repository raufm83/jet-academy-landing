import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';

@Injectable()
export class GalleryService {
  private readonly uploadDir = 'uploads-acad';
  private readonly galleryImageDir = 'gallery';

  constructor(private prisma: PrismaService) {}

  private getRelativeImagePath(filename: string | null): string | null {
    return filename ? path.join(this.galleryImageDir, filename) : null;
  }

  private getAbsoluteImagePath(filename: string): string {
    return path.join(
      process.cwd(),
      this.uploadDir,
      this.galleryImageDir,
      filename,
    );
  }

  async create(createGalleryDto: CreateGalleryDto & { imageUrl: string }) {
    try {
      const totalImages = await this.prisma.gallery.count();
      const imageUrl = this.getRelativeImagePath(createGalleryDto.imageUrl);

      return await this.prisma.gallery.create({
        data: {
          ...createGalleryDto,
          title: {
            az: createGalleryDto.title.az,
            en: createGalleryDto.title.en,
          },
          imageUrl,
          order: totalImages,
        },
      });
    } catch (error) {
      if (createGalleryDto.imageUrl) {
        await this.cleanupImage(createGalleryDto.imageUrl);
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        this.prisma.gallery.count(),
        this.prisma.gallery.findMany({
          skip,
          take: +limit,
          orderBy: {
            order: 'asc',
          },
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
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }

    return gallery;
  }

  async update(
    id: string,
    updateGalleryDto: UpdateGalleryDto & { imageUrl?: string; order?: number },
  ) {
    console.log(
      'Service Update payload:',
      JSON.stringify(updateGalleryDto, null, 2),
    );
    const existingGallery = await this.findOne(id);
    const oldImageUrl = existingGallery.imageUrl;
    const { imageUrl, order, ...rest } = updateGalleryDto;

    try {
      const updateData: any = {
        ...rest,
        ...(imageUrl && { imageUrl: this.getRelativeImagePath(imageUrl) }),
      };

      if (rest.title) {
        updateData.title = {
          az: rest.title.az,
          en: rest.title.en,
        };
      }

      if (rest.imageAlt) {
        updateData.imageAlt = {
          az: rest.imageAlt.az,
          en: rest.imageAlt.en,
        };
      }

      if (
        typeof order === 'number' &&
        order >= 0 &&
        order !== existingGallery.order
      ) {
        const totalImages = await this.prisma.gallery.count();
        const targetOrder = Math.max(0, Math.min(order, Math.max(totalImages - 1, 0)));

        if (targetOrder !== existingGallery.order) {
          await this.prisma.$transaction(async (tx) => {
            if (targetOrder < existingGallery.order) {
              await tx.gallery.updateMany({
                where: {
                  id: { not: id },
                  order: {
                    gte: targetOrder,
                    lt: existingGallery.order,
                  },
                },
                data: {
                  order: {
                    increment: 1,
                  },
                },
              });
            } else {
              await tx.gallery.updateMany({
                where: {
                  id: { not: id },
                  order: {
                    gt: existingGallery.order,
                    lte: targetOrder,
                  },
                },
                data: {
                  order: {
                    decrement: 1,
                  },
                },
              });
            }

            await tx.gallery.update({
              where: { id },
              data: {
                ...updateData,
                order: targetOrder,
              },
            });
          });

          return this.findOne(id);
        }
      }

      const updatedGallery = await this.prisma.gallery.update({
        where: { id },
        data: updateData,
      });

      if (imageUrl && oldImageUrl && oldImageUrl !== updatedGallery.imageUrl) {
        const oldFilename = oldImageUrl.replace(`${this.galleryImageDir}/`, '');
        await this.cleanupImage(oldFilename);
      }

      return updatedGallery;
    } catch (error) {
      if (imageUrl) {
        await this.cleanupImage(imageUrl);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const gallery = await this.findOne(id);

      await this.prisma.$transaction([
        this.prisma.gallery.delete({
          where: { id },
        }),
        this.prisma.gallery.updateMany({
          where: {
            order: {
              gt: gallery.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        }),
      ]);

      if (gallery.imageUrl) {
        const filename = gallery.imageUrl.replace(
          `${this.galleryImageDir}/`,
          '',
        );
        await this.cleanupImage(filename);
      }

      return { id };
    } catch (error) {
      throw error;
    }
  }

  private async cleanupImage(filename: string) {
    if (!filename) return;

    try {
      const absolutePath = this.getAbsoluteImagePath(filename);
      const exists = await fs
        .access(absolutePath)
        .then(() => true)
        .catch(() => false);

      if (exists) {
        await fs.unlink(absolutePath);
      }
    } catch (error) {
      console.error('Error cleaning up image:', error);
    }
  }
}
