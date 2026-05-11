import { ApiProperty } from '@nestjs/swagger';

export class UpdateFaqItemDto {
  @ApiProperty({
    required: false,
    example: { az: 'Sual', en: 'Question' },
  })
  question?: { az: string; en: string };

  @ApiProperty({
    required: false,
    example: { az: 'Cavab', en: 'Answer' },
  })
  answer?: { az: string; en: string };

  @ApiProperty({ required: false })
  order?: number;

  @ApiProperty({ required: false })
  pages?: string[];
}
