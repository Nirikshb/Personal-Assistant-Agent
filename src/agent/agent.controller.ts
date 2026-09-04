import { Controller, Get, Query } from '@nestjs/common';
import { AgentService } from './agent.service.js';

@Controller('agent')
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  @Get('inbox')
  inbox(@Query('max') max?: string) {
    const parsed = Number(max ?? 10);
    return this.agent.inboxBrief(Number.isFinite(parsed) ? parsed : 10);
  }
}
