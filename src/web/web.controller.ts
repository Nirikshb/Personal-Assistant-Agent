import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WebService } from './web.service.js';

@Controller('web')
export class WebController {
  constructor(private readonly web: WebService) {}

  @Get('status')
  status() {
    return this.web.status();
  }

  @Get('search')
  search(@Query('q') q?: string) {
    const query = q?.trim();
    if (!query) {
      throw new BadRequestException('q is required');
    }
    return this.web.search(query);
  }

  @Get('read')
  read(@Query('url') url?: string) {
    const target = url?.trim();
    if (!target) {
      throw new BadRequestException('url is required');
    }
    return this.web.readPage(target);
  }
}
