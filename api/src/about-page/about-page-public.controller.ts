import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AboutPageService } from './about-page.service';

@ApiTags('About Page (Public)')
@Controller('about-page-public')
export class AboutPagePublicController {
  constructor(private readonly aboutPageService: AboutPageService) {}

  @Get()
  @ApiOperation({ summary: 'Haqqımızda CMS (icazəsiz)' })
  findOne() {
    return this.aboutPageService.findPublic();
  }
}
