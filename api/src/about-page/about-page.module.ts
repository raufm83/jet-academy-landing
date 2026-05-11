import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { AboutPageController } from './about-page.controller';
import { AboutPagePublicController } from './about-page-public.controller';
import { AboutPageService } from './about-page.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [AboutPagePublicController, AboutPageController],
  providers: [AboutPageService],
})
export class AboutPageModule {}
