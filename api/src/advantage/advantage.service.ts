import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdvantageDto } from './dto/create-advantage.dto';
import { UpdateAdvantageDto } from './dto/update-advantage.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdvantageService {
  constructor(private prisma: PrismaService) {}

  async create(createAdvantageDto: CreateAdvantageDto) {
    return this.prisma.advantage.create({
      data: createAdvantageDto as any,
    });
  }

  async findAll() {
    return this.prisma.advantage.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const advantage = await this.prisma.advantage.findUnique({
      where: { id },
    });
    if (!advantage) throw new NotFoundException('Advantage not found');
    return advantage;
  }

  async update(id: string, updateAdvantageDto: UpdateAdvantageDto) {
    await this.findOne(id);
    return this.prisma.advantage.update({
      where: { id },
      data: updateAdvantageDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.advantage.delete({
      where: { id },
    });
  }
}
