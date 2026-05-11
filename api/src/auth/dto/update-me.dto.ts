import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  surname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  surnameEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  positionEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}
