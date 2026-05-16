// main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as express from 'express';
import * as compression from 'compression';
import { HttpAdapterHost } from '@nestjs/core';
import {
  setCorsHeaders,
  CorsExceptionFilter,
  isAllowedOrigin,
} from './filters/cors-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Express body parser istifadə edəcəyik
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CorsExceptionFilter(httpAdapterHost));

  // CORS – hər sorğuda cavab göndərilməmişdən əvvəl header-lar təyin olunur
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      setCorsHeaders(res, req);

      // Ensure CORS headers are sent with every response (even on error)
      const originalWriteHead = res.writeHead.bind(res);
      (res as any).writeHead = function (
        statusCode: number,
        arg2?: string | object,
        arg3?: object,
      ) {
        setCorsHeaders(res, req);
        if (arg3 !== undefined) {
          return originalWriteHead(statusCode, arg2 as string, arg3);
        }
        if (typeof arg2 === 'object' && arg2 !== null) {
          return originalWriteHead(statusCode, arg2);
        }
        return originalWriteHead(statusCode, arg2 as string);
      };

      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
      }

      next();
    },
  );

  // Body parser limitləri - 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.raw({ limit: '50mb', type: 'application/octet-stream' }));

  // Gzip compression for all responses
  app.use(compression());

  // Nest CORS – preflight və uyğunluq üçün (header-lar artıq yuxarıda təyin olunur)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400,
  });

  // Static files middleware
  app.use((req, res, next) => {
    if (req.path.includes('/uploads/') || req.path.endsWith('.webp')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    next();
  });

  app.setGlobalPrefix('api');

  // Swagger config...
  const config = new DocumentBuilder()
    .setTitle('JET Academy API')
    .setDescription('API endpoints documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs/swagger/json',
  });

  app.use(
    '/reference',
    apiReference({
      theme: 'deepSpace',
      spec: {
        url: 'api/docs/swagger/json',
      },
    }),
  );

  app.use('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /uploads/\nDisallow: /*.webp$');
  });

  app.enableShutdownHooks();

  const port = process.env.PORT || 3002;
  await app.listen(port);
}

bootstrap();
