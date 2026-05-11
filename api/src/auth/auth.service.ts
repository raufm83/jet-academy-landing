import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      {
        secret: process.env.JWT_SECRET,
      },
    );

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: token,
    };
  }
  async register(createAuthDto: CreateAuthDto, avatarUrl?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hash(createAuthDto.password, 12);

    const fullName = createAuthDto.surname
      ? `${createAuthDto.name} ${createAuthDto.surname}`.trim()
      : createAuthDto.name;

    const isAuthor = createAuthDto.role === Role.AUTHOR;
    const authorMeta =
      isAuthor &&
      (createAuthDto.name ||
        createAuthDto.surname ||
        createAuthDto.position ||
        createAuthDto.nameEn ||
        createAuthDto.surnameEn ||
        createAuthDto.positionEn)
        ? {
            authorName: {
              az: createAuthDto.name?.trim() || '',
              en: createAuthDto.nameEn?.trim() || '',
            },
            authorSurname: {
              az: createAuthDto.surname?.trim() || '',
              en: createAuthDto.surnameEn?.trim() || '',
            },
            authorPosition: {
              az: createAuthDto.position?.trim() || '',
              en: createAuthDto.positionEn?.trim() || '',
            },
          }
        : undefined;

    const user = await this.prisma.user.create({
      data: {
        name: fullName,
        email: createAuthDto.email,
        password: hashedPassword,
        role: createAuthDto.role || Role.USER,
        profile: {
          create: {
            ...(createAuthDto.position && {
              profession: createAuthDto.position,
            }),
            ...(authorMeta && { socialLinks: authorMeta as any }),
            ...(avatarUrl && { avatarUrl }),
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return {
      message: 'User created successfully',
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            profession: true,
            socialLinks: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(
    userId: string,
    updateMeDto: UpdateMeDto,
    avatarUrl?: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const {
      surname,
      position,
      nameEn,
      surnameEn,
      positionEn,
      ...rest
    } = updateMeDto;

    const data: any = { ...rest };
    if (typeof updateMeDto.name === 'string') {
      const fullName =
        surname !== undefined
          ? `${updateMeDto.name} ${surname}`.trim()
          : updateMeDto.name;
      data.name = fullName;
    }
    if (updateMeDto.password) {
      data.password = await hash(updateMeDto.password, 12);
    }

    const isAuthor = existingUser.role === Role.AUTHOR;
    const sl = (existingUser.profile?.socialLinks as Record<string, { az?: string; en?: string }>) || undefined;

    if (isAuthor && (surname !== undefined || position !== undefined || nameEn !== undefined || surnameEn !== undefined || positionEn !== undefined)) {
      const authorMeta = {
        authorName: {
          az: (updateMeDto.name ?? existingUser.name?.split(' ')[0] ?? (sl?.authorName as any)?.az ?? '').trim(),
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

      const updated = await this.prisma.user.update({
        where: { id: userId },
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

      if (updated.profile) {
        await this.prisma.profile.update({
          where: { userId },
          data: {
            socialLinks: authorMeta as any,
            ...(position !== undefined && {
              profession: position.trim() || null,
            }),
            ...(avatarUrl && { avatarUrl }),
          },
        });
      } else {
        await this.prisma.profile.create({
          data: {
            userId,
            socialLinks: authorMeta as any,
            ...(position && { profession: position.trim() }),
            ...(avatarUrl && { avatarUrl }),
          },
        });
      }

      return this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: {
            select: { profession: true, socialLinks: true, avatarUrl: true },
          },
        },
      });
    }

    if (avatarUrl) {
      if (existingUser.profile) {
        await this.prisma.profile.update({
          where: { userId },
          data: { avatarUrl },
        });
      } else {
        await this.prisma.profile.create({
          data: {
            userId,
            avatarUrl,
          },
        });
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: { profession: true, socialLinks: true, avatarUrl: true },
        },
      },
    });
  }
}
