import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LangPairDto {
  @ApiProperty()
  az: string;

  @ApiProperty()
  en: string;
}

class JobLevelDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  az?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  en?: string;
}

export class CreateVacancyDto {
  @ApiProperty({ type: LangPairDto })
  @ValidateNested()
  @Type(() => LangPairDto)
  @IsObject()
  title: LangPairDto;

  @ApiProperty({ type: LangPairDto })
  @ValidateNested()
  @Type(() => LangPairDto)
  @IsObject()
  description: LangPairDto;

  @ApiProperty({ type: LangPairDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LangPairDto)
  requirements?: LangPairDto;

  @ApiProperty({
    type: LangPairDto,
    required: false,
    description: 'İş şəraiti (HTML, rich text). AZ və EN.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LangPairDto)
  workConditions?: LangPairDto;

  @ApiProperty({
    required: false,
    example: { az: 'Mid-senior', en: 'Mid-senior' },
    description: 'Alt başlıq (kartda başlıq altında)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobLevelDto)
  jobLevel?: JobLevelDto;

  @ApiProperty({
    required: false,
    example: { az: ['Marketinq', 'Uzaqdan'], en: ['Marketing', 'Remote'] },
  })
  @IsOptional()
  tags?: { az?: string[]; en?: string[] };

  @ApiProperty({ required: false, example: 'Full-Time' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiProperty({ required: false, example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    required: false,
    example: { az: 'slug-az', en: 'slug-en' },
  })
  @IsOptional()
  slug?: { az?: string; en?: string };

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}
