import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { FaqController } from './faq.controller';
import { FaqPublicController } from './faq-public.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [FaqPublicController, FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
