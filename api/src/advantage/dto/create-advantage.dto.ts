import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateAdvantageDto {
  @IsObject()
  @IsNotEmpty()
  title: Record<string, string>;

  @IsObject()
  @IsNotEmpty()
  description: Record<string, string>;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
