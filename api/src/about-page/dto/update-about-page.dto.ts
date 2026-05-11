import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class AboutLocalesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  az?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;
}

export class UpdateAboutPageDto {
  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  introTitle?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  introDescription1?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  introDescription2?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  introDescription3?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  introImageAlt?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  missionSectionTitle?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  missionTitle?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  missionDescription?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  visionTitle?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  visionDescription?: AboutLocalesDto;

  @ApiPropertyOptional({ type: AboutLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocalesDto)
  missionVisionImageAlt?: AboutLocalesDto;
}
