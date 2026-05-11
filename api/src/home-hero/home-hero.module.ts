import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { HomeHeroController } from './home-hero.controller';
import { HomeHeroPublicController } from './home-hero-public.controller';
import { HomeHeroService } from './home-hero.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [HomeHeroPublicController, HomeHeroController],
  providers: [HomeHeroService],
})
export class HomeHeroModule {}
