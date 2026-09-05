import { Module } from '@nestjs/common';
import { GmailModule } from '../gmail/gmail.module.js';
import { OllamaModule } from '../ollama/ollama.module.js';
import { AgentController } from './agent.controller.js';
import { AgentService } from './agent.service.js';
import { WebModule } from '../web/web.module.js';
@Module({
  imports: [GmailModule, OllamaModule, WebModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule { }
