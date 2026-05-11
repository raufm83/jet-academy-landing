import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TranslatedField {
  @IsString()
  az: string;

  @IsString()
  en?: string;
}

export class CreateTeamDto {
  @ApiProperty({
    example: {
      az: 'Ad',
      en: 'Name',
    },
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  name: TranslatedField;

  @ApiProperty({
    example: {
      az: 'Soyad',
      en: 'Surname',
    },
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  surname: TranslatedField;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  bio: any;

  imageUrl?: string;

  @ApiProperty({
    example: {
      az: 'Müəllim haqqında alt mətn',
      en: 'Alt text about teacher',
    },
    required: false,
  })
  @ValidateNested()
  @Type(() => TranslatedField)
  @IsObject()
  @IsOptional()
  imageAlt?: TranslatedField;
}
