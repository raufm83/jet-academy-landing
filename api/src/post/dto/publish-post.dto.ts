import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishPostDto {
  @ApiProperty({ description: 'Whether the post is published / visible on the site' })
  @IsBoolean()
  published!: boolean;
}
