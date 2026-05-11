import { PartialType } from '@nestjs/swagger';
import { CreateGraduateDto } from './create-graduate.dto';

export class UpdateGraduateDto extends PartialType(CreateGraduateDto) {}
