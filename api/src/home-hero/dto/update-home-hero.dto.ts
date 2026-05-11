import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

/** Hero məzmunu: yalnız AZ və EN */
export class HeroLocalesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  az?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;
}

export class UpdateHomeHeroDto {
  @ApiPropertyOptional({ type: HeroLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroLocalesDto)
  contentHtml?: HeroLocalesDto;

  @ApiPropertyOptional({ type: HeroLocalesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeroLocalesDto)
  imageAlt?: HeroLocalesDto;
}
