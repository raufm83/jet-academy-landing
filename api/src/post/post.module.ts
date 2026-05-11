import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { SharpPipe } from 'src/pipes/sharp.pipe';
import { OptionalJwtAuthGuard } from 'src/guards/optional-jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register(),
    PrismaModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    OptionalJwtAuthGuard,
    {
      provide: SharpPipe,
      useFactory: () =>
        /**
         * 1600px qutunun içində sığdır, kəsmə yox; WebP kalitesi 82 — böyük
         * cover şəkillər üçün balanslı ölçü / keyfiyyət kombinasiyası.
         */
        new SharpPipe('post', 1600, 82, true),
    },
  ],
})
export class PostModule { }
