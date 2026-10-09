import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdvantageService } from './advantage.service';
import { AdvantageController } from './advantage.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [AdvantageController],
  providers: [AdvantageService],
})
export class AdvantageModule {}
