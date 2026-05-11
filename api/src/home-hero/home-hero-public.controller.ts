import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeHeroService } from './home-hero.service';

@ApiTags('Home Hero (Public)')
@Controller('home-hero-public')
export class HomeHeroPublicController {
  constructor(private readonly homeHeroService: HomeHeroService) {}

  @Get()
  @ApiOperation({ summary: 'Ana səhifə hero məzmunu (icazəsiz)' })
  findOne() {
    return this.homeHeroService.findPublic();
  }
}
