import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateAuthDto {
  @ApiProperty()
  @IsString()
  name: string;

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

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role, default: Role.USER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
