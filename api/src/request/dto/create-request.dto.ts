import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { Language } from '@prisma/client';

/** Spam qarşısı: bu sahə doldurulubsa müraciət qəbul edilmir (honeypot) */
export const HONEYPOT_FIELD = 'website';

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsInt()
  childAge: number;

  @ApiProperty({ enum: Language, default: Language.AZ })
  @IsEnum(Language)
  childLanguage: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  additionalInfo?: any;

  /** Spam qarşısı: doldurulubsa rədd edilir (honeypot – API-dan göndərməyin) */
  @ApiProperty({ required: false, description: 'Honeypot – leave empty' })
  @IsOptional()
  @IsString()
  [HONEYPOT_FIELD]?: string;

  @ApiProperty({ required: false, description: 'Riyazi CAPTCHA: birinci ədəd (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  captchaA?: number;

  @ApiProperty({ required: false, description: 'Riyazi CAPTCHA: ikinci ədəd (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  captchaB?: number;

  @ApiProperty({ required: false, description: 'Riyazi CAPTCHA: istifadəçi cavabı (a + b)' })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(18)
  captchaAnswer?: number;
}
