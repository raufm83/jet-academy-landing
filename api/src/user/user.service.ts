import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const {
      surname,
      position,
      nameEn,
      surnameEn,
      positionEn,
    } = updateUserDto;

    /**
     * `user` modelində olmayan sahələr (məs. `categoryId`) Prisma error-u verirdi.
     * Yalnız `User` modelinə aid sahələri birbaşa `data`-ya yazırıq.
     */
    const data: any = {};
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
    if (updateUserDto.role !== undefined) data.role = updateUserDto.role;
    if (updateUserDto.password) {
      data.password = await hash(updateUserDto.password, 12);
    }
    const sl = (existingUser as any).profile?.socialLinks as Record<string, { az?: string; en?: string }> | null | undefined;
    if (updateUserDto.name !== undefined) {
      const fullName =
        surname !== undefined
          ? `${updateUserDto.name} ${surname}`.trim()
          : updateUserDto.name;
      data.name = fullName;
    }

    const role = updateUserDto.role ?? existingUser.role;
    const isAuthor = role === 'AUTHOR';

    if (isAuthor && (surname !== undefined || position !== undefined || nameEn !== undefined || surnameEn !== undefined || positionEn !== undefined)) {
      const authorMeta = {
        authorName: {
          az: (updateUserDto.name ?? (sl?.authorName as any)?.az ?? existingUser.name.split(' ')[0])?.trim() ?? '',
          en: (nameEn?.trim() ?? (sl?.authorName as any)?.en ?? '').trim(),
        },
        authorSurname: {
          az: (surname?.trim() ?? (sl?.authorSurname as any)?.az ?? '').trim(),
          en: (surnameEn?.trim() ?? (sl?.authorSurname as any)?.en ?? '').trim(),
        },
        authorPosition: {
          az: (position?.trim() ?? (sl?.authorPosition as any)?.az ?? '').trim(),
          en: (positionEn?.trim() ?? (sl?.authorPosition as any)?.en ?? '').trim(),
        },
      };
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { id: true } },
        },
      });
      if (updatedUser.profile) {
        await this.prisma.profile.update({
          where: { userId: id },
          data: {
            socialLinks: authorMeta as any,
            ...(position !== undefined && { profession: position.trim() || null }),
          },
        });
      } else {
        await this.prisma.profile.create({
          data: {
            userId: id,
            socialLinks: authorMeta as any,
            ...(position && { profession: position.trim() }),
          },
        });
      }
      return this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: true,
        },
      });
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
