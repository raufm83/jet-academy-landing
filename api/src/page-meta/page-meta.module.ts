import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma.module';
import { PageMetaController } from './page-meta.controller';
import { PageMetaService } from './page-meta.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [PageMetaController],
  providers: [PageMetaService],
  exports: [PageMetaService],
})
export class PageMetaModule {}
