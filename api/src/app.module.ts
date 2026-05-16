import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { GalleryModule } from './gallery/gallery.module';
import { PrismaModule } from './prisma.module';
import { RequestModule } from './request/request.module';
import { StudentProjectModule } from './student-project/student-project.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { CourseEligibilityModule } from './course-eligibility/course-eligibility.module';
import { CourseModuleModule } from './course-module/course-module.module';
import { CourseTeacherModule } from './course-teacher/course-teacher.module';
import { PostModule } from './post/post.module';
import { GlossaryModule } from './glossary/glossary.module';
import { PageMetaModule } from './page-meta/page-meta.module';
import { FaqModule } from './faq/faq.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { GraduateModule } from './graduate/graduate.module';
import { HomeHeroModule } from './home-hero/home-hero.module';
import { AboutPageModule } from './about-page/about-page.module';
import { BlogCategoryModule } from './blog-category/blog-category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RequestModule,
    StudentProjectModule,
    TeamModule,
    // ServeStaticModule - CORS headers əlavə edilib
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads-acad'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res, path, stat) => {
          void stat;
          // CORS headers for static files
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.set(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept',
          );
          res.set('Cross-Origin-Resource-Policy', 'cross-origin');

          // Cache control for images
          if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
          }

          // Security headers
          res.set('X-Content-Type-Options', 'nosniff');
          res.set('X-Frame-Options', 'DENY');
          res.set('X-XSS-Protection', '1; mode=block');
        },
      },
    }),
    ContactModule,
    GalleryModule,
    CourseModule,
    CourseEligibilityModule,
    CourseModuleModule,
    CourseTeacherModule,
    PostModule,
    GlossaryModule,
    PageMetaModule,
    FaqModule,
    VacancyModule,
    GraduateModule,
    HomeHeroModule,
    AboutPageModule,
    BlogCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
