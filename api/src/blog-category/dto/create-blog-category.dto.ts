import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlogCategoryDto {
  @ApiProperty({ example: 'Texnologiya' })
  @IsString()
  'name[az]': string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  'name[en]': string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
