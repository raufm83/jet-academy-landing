import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FaqService } from './faq.service';

@ApiTags('FAQ (Public)')
@Controller('faq-public')
export class FaqPublicController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Public: FAQ-ları səhifə key-ə görə göstər' })
  @ApiQuery({ name: 'pageKey', required: true, example: 'home' })
  findByPage(@Query('pageKey') pageKey: string) {
    if (!pageKey || typeof pageKey !== 'string') {
      return [];
    }
    return this.faqService.findByPage(pageKey.trim());
  }
}
