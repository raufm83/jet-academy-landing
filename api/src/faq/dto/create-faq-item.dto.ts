import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqItemDto {
  @ApiProperty({
    example: { az: 'Kurslar neçə yaşdan başlayır?', en: 'At what age do courses start?' },
  })
  question: { az: string; en: string };

  @ApiProperty({
    example: {
      az: 'Kurslarımız 8–17 yaş arası üçün nəzərdə tutulub.',
      en: 'Our courses are designed for ages 8–17.',
    },
  })
  answer: { az: string; en: string };

  @ApiProperty({ required: false, default: 0 })
  order?: number;

  @ApiProperty({
    required: false,
    example: ['home', 'courses'],
    description: 'Page keys where this FAQ will be shown (e.g. home, courses, about, contact, reviews, blog, course:slug)',
  })
  pages?: string[];
}
