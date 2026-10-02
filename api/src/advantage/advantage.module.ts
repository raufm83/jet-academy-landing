import { Module } from '@nestjs/common';
import { AdvantageService } from './advantage.service';
import { AdvantageController } from './advantage.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdvantageController],
  providers: [AdvantageService],
})
export class AdvantageModule {}
