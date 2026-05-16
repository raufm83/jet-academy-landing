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

class MultilingualFieldUpdate {
  @ApiProperty({
    description: 'Text in Azerbaijani',
    example: 'Post başlığı',
    required: false,
  })
  @IsString()
  @IsOptional()
  az?: string;

  @ApiProperty({
    description: 'Text in English',
    example: 'Post title',
    required: false,
  })
  @IsString()
  @IsOptional()
  en?: string;
}

export class UpdatePostDto {
  @ApiProperty({
    description:
      'Blog category id, or omit; empty clears category (BLOG posts only)',
    required: false,
  })
  @IsString()
  @IsOptional()
  blogCategoryId?: string;

  @ApiProperty({
    description: 'Title of the post (multilingual)',
    type: MultilingualFieldUpdate,
    required: false,
  })
  @ValidateNested()
  @Type(() => MultilingualFieldUpdate)
  @IsOptional()
  title?: MultilingualFieldUpdate;

  @ApiProperty({
    description: 'Content of the post (multilingual)',
    type: MultilingualFieldUpdate,
    required: false,
  })
  @ValidateNested()
  @Type(() => MultilingualFieldUpdate)
  @IsOptional()
  content?: MultilingualFieldUpdate;

  @ApiProperty({
    description: 'Slug of the post (multilingual)',
    type: MultilingualFieldUpdate,
    required: false,
  })
  @ValidateNested()
  @Type(() => MultilingualFieldUpdate)
  @IsOptional()
  slug?: MultilingualFieldUpdate;

  @ApiProperty({
    description: 'Whether the post is published',
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

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

  /** Controller tərəfindən fayllardan doldurulur */
  imageUrlAz?: string;
  imageUrlEn?: string;

  @ApiProperty({
    description: 'Tags for the post',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Type of the post',
    required: false,
    enum: PostType,
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
