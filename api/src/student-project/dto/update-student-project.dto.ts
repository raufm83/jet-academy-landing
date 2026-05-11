import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStudentProjectDto } from './create-student-project.dto';

export class UpdateStudentProjectDto extends PartialType(
  CreateStudentProjectDto,
) {
  @ApiPropertyOptional({ description: 'Display order (0-based)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
