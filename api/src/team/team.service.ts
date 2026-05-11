/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  private readonly uploadDir = 'uploads-acad';
  private readonly teamImageDir = 'team';

  constructor(private prisma: PrismaService) {}

  private getRelativeImagePath(filename: string | null): string | null {
    return filename ? path.join(this.teamImageDir, filename) : null;
  }

  private getAbsoluteImagePath(filename: string): string {
    return path.join(
      process.cwd(),
      this.uploadDir,
      this.teamImageDir,
      filename,
    );
  }

  /** Prisma `MultilingualText` həm `az`, həm `en` tələb edir */
  private toMultilingualText(field: { az: string; en?: string }): {
    az: string;
    en: string;
  } {
    return {
      az: field.az,
      en: field.en ?? field.az,
    };
  }

  async create(createTeamDto: CreateTeamDto & { imageUrl: string }) {
    try {
      const totalMembers = await this.prisma.team.count();
      const imageUrl = this.getRelativeImagePath(createTeamDto.imageUrl);
      const nameMt = this.toMultilingualText(createTeamDto.name);
      const surnameMt = this.toMultilingualText(createTeamDto.surname);
      const fullName = {
        az: `${nameMt.az} ${surnameMt.az}`,
        en: `${nameMt.en} ${surnameMt.en}`,
      };

      // Handle bio field - can be object, string (JSON), or nested format bio[az]/bio[en]
      let bio: any;
      if (
        createTeamDto.bio &&
        typeof createTeamDto.bio === 'object' &&
        'az' in createTeamDto.bio
      ) {
        // Already an object with az property
        bio = createTeamDto.bio;
      } else if (typeof createTeamDto.bio === 'string') {
        // Try to parse as JSON
        try {
          bio = JSON.parse(createTeamDto.bio);
        } catch {
          // If not valid JSON, treat as az value
          bio = { az: createTeamDto.bio, en: '' };
        }
      } else {
        bio = createTeamDto.bio || { az: '', en: '' };
      }

      return await this.prisma.team.create({
        data: {
          name: nameMt,
          surname: surnameMt,
          imageUrl: imageUrl as string,
          bio,
          fullName,
          ...(createTeamDto.imageAlt && {
            imageAlt: this.toMultilingualText(createTeamDto.imageAlt),
          }),
          order: totalMembers,
          isActive: true,
        },
      });
    } catch (error) {
      if (createTeamDto.imageUrl) {
        await this.cleanupImage(createTeamDto.imageUrl);
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        this.prisma.team.count(),
        this.prisma.team.findMany({
          skip,
          take: +limit,
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            surname: true,
            createdAt: true,
            fullName: true,
            imageUrl: true,
            bio: true,
            order: true,
            isActive: true,
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

  async findActive() {
    const result = await this.prisma.team.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        surname: true,
        fullName: true,
        imageUrl: true,
        bio: true,
        order: true,
        isActive: true,
      },
    });
    return result;
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        surname: true,
        fullName: true,
        imageUrl: true,
        bio: true,
        order: true,
        isActive: true,
      },
    });

    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return team;
  }

  async update(
    id: string,
    updateTeamDto: UpdateTeamDto & { imageUrl?: string; order?: number },
  ) {
    const existingTeam = await this.findOne(id);
    const oldImageUrl = existingTeam.imageUrl;
    const {
      imageUrl,
      image,
      order,
      bio,
      name: nameField,
      surname: surnameField,
      imageAlt,
      ...rest
    } = updateTeamDto;

    try {
      // Handle bio field - can be object, string (JSON), or nested format bio[az]/bio[en]
      let processedBio: any = undefined;
      if (bio) {
        if (typeof bio === 'object' && 'az' in bio) {
          // Already an object with az property
          processedBio = bio;
        } else if (typeof bio === 'string') {
          // Try to parse as JSON
          try {
            processedBio = JSON.parse(bio);
          } catch {
            // If not valid JSON, treat as az value
            processedBio = { az: bio, en: '' };
          }
        } else {
          processedBio = bio;
        }
      }

      const updateData: any = {
        ...rest,
        ...(imageUrl && { imageUrl: this.getRelativeImagePath(imageUrl) }),
        ...(processedBio && { bio: processedBio }),
      };

      if (nameField) {
        updateData.name = this.toMultilingualText(nameField);
      }
      if (surnameField) {
        updateData.surname = this.toMultilingualText(surnameField);
      }
      if (imageAlt) {
        updateData.imageAlt = this.toMultilingualText(imageAlt);
      }

      if (nameField || surnameField) {
        const name = nameField
          ? updateData.name
          : (existingTeam.name as { az: string; en: string });
        const surname = surnameField
          ? updateData.surname
          : (existingTeam.surname as { az: string; en: string });
        updateData.fullName = {
          az: `${name.az} ${surname.az}`,
          en: `${name.en} ${surname.en}`,
        };
      }

      if (typeof order === 'number') {
        const allTeamMembers = await this.prisma.team.findMany({
          orderBy: { order: 'asc' },
        });

        if (order < 0 || order >= allTeamMembers.length) {
          throw new Error('Invalid order value');
        }

        if (order < existingTeam.order) {
          await this.prisma.$transaction([
            this.prisma.team.updateMany({
              where: {
                AND: [
                  { order: { gte: order } },
                  { order: { lt: existingTeam.order } },
                  { id: { not: id } },
                ],
              },
              data: {
                order: { increment: 1 },
              },
            }),
            this.prisma.team.update({
              where: { id },
              data: {
                ...updateData,
                order: order,
              },
            }),
          ]);
        } else if (order > existingTeam.order) {
          await this.prisma.$transaction([
            this.prisma.team.updateMany({
              where: {
                AND: [
                  { order: { gt: existingTeam.order } },
                  { order: { lte: order } },
                  { id: { not: id } },
                ],
              },
              data: {
                order: { decrement: 1 },
              },
            }),
            this.prisma.team.update({
              where: { id },
              data: {
                ...updateData,
                order: order,
              },
            }),
          ]);
        }

        const updatedMembers = await this.prisma.team.findMany({
          orderBy: { order: 'asc' },
        });

        const needsFix = updatedMembers.some(
          (member, index) => member.order !== index,
        );

        if (needsFix) {
          await this.prisma.$transaction(
            updatedMembers.map((member, index) =>
              this.prisma.team.update({
                where: { id: member.id },
                data: { order: index },
              }),
            ),
          );
        }

        return await this.findOne(id);
      }

      const updatedTeam = await this.prisma.team.update({
        where: { id },
        data: updateData,
      });

      if (imageUrl && oldImageUrl && oldImageUrl !== updatedTeam.imageUrl) {
        const oldFilename = oldImageUrl.replace(`${this.teamImageDir}/`, '');
        await this.cleanupImage(oldFilename);
      }

      return updatedTeam;
    } catch (error) {
      if (imageUrl) {
        await this.cleanupImage(imageUrl);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const team = await this.findOne(id);

      await this.prisma.$transaction([
        this.prisma.team.delete({
          where: { id },
        }),
        this.prisma.team.updateMany({
          where: {
            order: {
              gt: team.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        }),
      ]);

      const remainingMembers = await this.prisma.team.findMany({
        orderBy: { order: 'asc' },
      });

      const needsFix = remainingMembers.some(
        (member, index) => member.order !== index,
      );

      if (needsFix) {
        await this.prisma.$transaction(
          remainingMembers.map((member, index) =>
            this.prisma.team.update({
              where: { id: member.id },
              data: { order: index },
            }),
          ),
        );
      }

      if (team.imageUrl) {
        const filename = team.imageUrl.replace(`${this.teamImageDir}/`, '');
        await this.cleanupImage(filename);
      }

      return { id };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, isActive: boolean) {
    const team = await this.findOne(id);
    return this.prisma.team.update({
      where: { id },
      data: { isActive },
    });
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
