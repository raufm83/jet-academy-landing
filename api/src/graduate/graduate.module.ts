import { Module } from '@nestjs/common';
import { GraduateService } from './graduate.service';
import { GraduateController } from './graduate.controller';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register(),
    PrismaModule,
  ],
  controllers: [GraduateController],
  providers: [GraduateService],
})
export class GraduateModule {}
