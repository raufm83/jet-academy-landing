import { IsString, IsObject, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class CreateCourseEligibilityDto {
  @IsObject()
  @ApiProperty({
    example: {
      az: 'Riyaziyyat biliyi',
      en: 'Knowledge of mathematics',
    },
  })
  title: Prisma.JsonValue;

  @IsObject()
  @ApiProperty({
    example: {
      az: 'Orta məktəb riyaziyyat bilikləri',
      en: 'Knowledge of high school mathematics',
    },
  })
  description: Prisma.JsonValue;

  @IsString()
  @ApiProperty({ example: 'calculator' })
  icon: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({
    description:
      'Sıralama — böyük dəyər əvvəl. Boş saxlanılsa avtomatik (max mövcud + 1).',
    example: 10,
  })
  order?: number;
}
