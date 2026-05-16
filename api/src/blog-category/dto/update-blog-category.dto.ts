import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBlogCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  'name[az]'?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  'name[en]'?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
