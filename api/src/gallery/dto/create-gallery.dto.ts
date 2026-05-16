import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({
    example: {
      az: 'Mobil Tətbiq Layihəsi',
      en: 'Mobile application project',
    },
    description: 'Project title in multiple languages (Azerbaijani, Russian)',
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  })
  @IsOptional()
  title: Record<string, any>;

  imageUrl?: string;

  @ApiProperty({
    example: { az: 'Alt text', en: 'Alt text' },
    required: false,
  })
  @IsOptional()
  imageAlt?: Record<string, any>;
}
