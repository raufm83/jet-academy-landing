import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpsertPageMetaDto {
  @ApiProperty({
    description: 'Page identifier (e.g. courses, about-us, course:slug)',
    example: 'courses',
  })
  @IsString()
  pageKey: string;

  @ApiProperty({ description: 'Locale', enum: ['az', 'en'], example: 'az' })
  @IsString()
  @IsIn(['az', 'en'])
  locale: string;

  @ApiProperty({ description: 'Meta title', example: 'Kurslar | JET Academy' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Meta description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
