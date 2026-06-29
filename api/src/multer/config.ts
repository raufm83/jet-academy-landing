import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

/** Mətn sahələri (məs. content[az]/[en]) üçün; busboy default 1 MB-dir və uzun Quill HTML tez aşılır. */
const MULTIPART_MAX_FIELD_BYTES = 20 * 1024 * 1024;

export const multerConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    fieldSize: MULTIPART_MAX_FIELD_BYTES,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif|heic|heif|tiff|bmp)$/i)) {
      return cb(
        new BadRequestException(
          'Yalnız şəkil faylı seçin (məs. JPG, PNG, WebP, AVIF).',
        ),
        false,
      );
    }
    if (!file.mimetype.match(/^image\//i)) {
      return cb(
        new BadRequestException(
          'Bu fayl növü dəstəklənmir. Şəkil faylı istifadə edin.',
        ),
        false,
      );
    }
    cb(null, true);
  },
};
