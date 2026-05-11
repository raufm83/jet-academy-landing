import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class TranslatedField {
  @IsString()
  az: string;

  @IsString()
  en: string;
}

export class CreateCourseDto {
  @ApiProperty({
    example: {
      az: 'IT və Kompüter Mühəndisliyi',
      en: 'IT and computer engineering',
    },
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  title: TranslatedField;

  @ApiProperty({
    example: {
      az: 'Tam stack veb proqramlaşdırma kursu',
      en: 'Full Stack Web Development Course',
    },
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  description: TranslatedField;

  @ApiProperty({
    example: { az: 'qisa-tesvir', en: 'short-description' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  shortDescription?: TranslatedField;

  @ApiProperty({ example: 'computer-icon.png', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: { az: 'full-stack-development', en: 'full-stack-development' },
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  slug: TranslatedField;

  @ApiProperty({
    example: 1.5,
    description: 'Duration in months (decimals allowed, e.g. 1.5)',
  })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  })
  @IsNumber(
    { maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false },
    { message: 'duration must be a number with at most 2 decimal places' },
  )
  @IsPositive()
  duration: number;

  @ApiProperty({ example: { az: 'Başlanğıc', en: 'Beginner' } })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  level: TranslatedField;

  @ApiProperty({
    example: { az: ['Scratch', 'HTML'], en: ['Scratch', 'HTML'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  newTags?: {
    az?: string[];
    en?: string[];
  };

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  published?: boolean;

  @ApiProperty({ example: '9-15', description: 'Age range' })
  @IsOptional()
  @IsString()
  ageRange?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Course image file',
  })
  @IsOptional()
  image?: any;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: { az: 'Alt text', en: 'Alt text' },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  imageAlt?: TranslatedField;

  @ApiProperty({ example: 2, description: 'Lessons per week', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  })
  @IsInt()
  lessonPerWeek?: number;

  @ApiProperty({ example: '#FEF3C7', required: false })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({ example: '#F59E0B', required: false })
  @IsOptional()
  @IsString()
  borderColor?: string;

  @ApiProperty({ example: '#1F2937', required: false })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiProperty({
    example: 0,
    required: false,
    description: 'Sıralama: böyük dəyər siyahıda əvvəl (prioritet)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = parseInt(String(value), 10);
    return Number.isNaN(num) ? undefined : num;
  })
  @IsInt()
  order?: number;
}
