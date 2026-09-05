import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AgentService } from './agent.service.js';
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Get('inbox')
  inbox(@Query('max') max?: string) {
    const parsed = Number(max ?? 10);
    return this.agentService.inboxBrief(Number.isFinite(parsed) ? parsed : 10);
  }

  @Get('web-search')
  webSearch(@Query('q') q?: string) {
    if (!q?.trim()) {
      throw new BadRequestException('q is required');
    }

    return this.agentService.webSearch(q.trim());
  }

  @Get('web-read')
  webRead(@Query('url') url?: string) {
    if (!url?.trim()) {
      throw new BadRequestException('url is required');
    }

    return this.agentService.webRead(url.trim());
  }


  @Post()
  agent(@Body() body: { message?: string }) {
    const message = body?.message?.trim();

    if (!message) {
      throw new BadRequestException('message is required');
    }

    return this.agentService.run(message);
  }
}
