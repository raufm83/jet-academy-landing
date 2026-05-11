import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType, EventStatus } from '@prisma/client';

class MultilingualField {
  @ApiProperty({
    description: 'Text in Azerbaijani',
    example: 'Post başlığı',
  })
  @IsString()
  az: string;

  @ApiProperty({
    description: 'Text in English',
    example: 'Post title',
  })
  @IsString()
  en: string;
}

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post (multilingual)',
    type: MultilingualField,
  })
  @ValidateNested()
  @Type(() => MultilingualField)
  title: MultilingualField;

  @ApiProperty({
    description: 'Content of the post (multilingual)',
    type: MultilingualField,
  })
  @ValidateNested()
  @Type(() => MultilingualField)
  content: MultilingualField;

  @ApiProperty({
    description: 'Slug of the post (multilingual)',
    type: MultilingualField,
  })
  @ValidateNested()
  @Type(() => MultilingualField)
  slug: MultilingualField;

  @ApiProperty({
    description: 'Whether the post is published',
    required: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiProperty({
    description: 'Single image for both locales (legacy)',
    required: false,
    type: 'string',
    format: 'binary',
  })
  image?: any;

  @ApiProperty({
    description: 'Post image (AZ)',
    required: false,
    type: 'string',
    format: 'binary',
  })
  imageAz?: any;

  @ApiProperty({
    description: 'Post image (EN)',
    required: false,
    type: 'string',
    format: 'binary',
  })
  imageEn?: any;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Alt text for the post image (multilingual)',
    type: MultilingualField,
    required: false,
  })
  @ValidateNested()
  @Type(() => MultilingualField)
  @IsOptional()
  imageAlt?: MultilingualField;

  @ApiProperty({
    description: 'Tags for the post',
    required: false,
    type: [String],
    default: [],
  })
  @IsArray()
  @IsOptional()
  tags?: MultilingualField[];

  @ApiProperty({
    description: 'Type of the post',
    required: false,
    enum: PostType,
    default: PostType.BLOG,
  })
  @IsEnum(PostType)
  @IsOptional()
  postType?: PostType;

  @ApiProperty({
    description: 'Event date (only for EVENT post type)',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @ApiProperty({
    description: 'Event status (only for EVENT post type)',
    required: false,
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  eventStatus?: EventStatus;

  @ApiProperty({
    description: 'Offer start date (only for OFFERS post type)',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  offerStartDate?: string;

  @ApiProperty({
    description: 'Offer end date (only for OFFERS post type)',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  offerEndDate?: string;
}
