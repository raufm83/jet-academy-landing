import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>> {
  /** @param folder e.g. 'post-content' | 'profile' | 'team'
   *  @param maxSize max width (and height when keepAspectRatio=false) of output image
   *  @param webpQuality 1–100, default 90
   *  @param keepAspectRatio when true, only limits max width; height is auto (no cropping)
   */
  constructor(
    private folder?: string,
    private maxSize = 1024,
    private webpQuality = 90,
    private keepAspectRatio = false,
  ) {}

  async transform(image: Express.Multer.File): Promise<string> {
    let inputBuffer: Buffer;
    if (image?.buffer && Buffer.isBuffer(image.buffer)) {
      inputBuffer = image.buffer;
    } else if (image?.path) {
      try {
        inputBuffer = await fs.readFile(image.path);
      } catch (readErr) {
        console.error('SharpPipe: could not read file from path', image.path, readErr);
        return null;
      }
    } else {
      return null;
    }

    const originalName = path.parse(image.originalname || 'image').name;
    const filename = `${originalName}-${Date.now()}.webp`;
    const folder = this.folder || '';
    const uploadPath = path.join(process.cwd(), 'uploads-acad', folder);
    const outputPath = path.join(uploadPath, filename);

    try {
      await fs.mkdir(uploadPath, { recursive: true });

      const quality = Math.min(100, Math.max(1, this.webpQuality));
      const size = Math.max(1, this.maxSize);

      /** keepAspectRatio: bütün şəkil görünsün — heç bir kəsmə yox (içində sığdır, maks. ölçü qutusuna) */
      const resizeOptions = this.keepAspectRatio
        ? sharp(inputBuffer).resize({
            width: size,
            height: size,
            fit: 'inside',
            withoutEnlargement: true,
          })
        : sharp(inputBuffer).resize(size, size, {
            fit: 'cover',
            position: 'center',
          });

      const pipeline = resizeOptions.webp({ quality });

      await pipeline.toFile(outputPath);

      return filename;
    } catch (error) {
      console.error('Sharp processing error:', error);
      try {
        await fs.unlink(outputPath).catch(() => {});
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      throw new BadRequestException(
        'Şəkil saxlanılmadı. Faylın pozulmamasını və JPG, PNG, GIF və ya WebP formatında olduğunu yoxlayın.',
      );
    }
  }
}
