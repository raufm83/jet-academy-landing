import { ApiProperty } from '@nestjs/swagger';

class LangPairDto {
  @ApiProperty() az: string;
  @ApiProperty() en: string;
}

export class CreateGraduateDto {
  @ApiProperty({ type: LangPairDto })
  name: { az: string; en: string };

  @ApiProperty({ type: LangPairDto })
  story: { az: string; en: string };

  @ApiProperty({ enum: ['image', 'youtube'], default: 'image' })
  mediaType?: string;

  @ApiProperty({ required: false, description: 'YouTube URL (only when mediaType=youtube)' })
  mediaUrl?: string;

  @ApiProperty({ required: false, description: 'Course ObjectId' })
  courseId?: string;

  @ApiProperty({ required: false, default: true })
  isActive?: boolean;

  @ApiProperty({ required: false, default: 0 })
  order?: number;
}
