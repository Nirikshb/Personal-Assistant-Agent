import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { OllamaService } from './ollama.service.js';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollama: OllamaService) {}

  @Get('health')
  health() {
    return this.ollama.health();
  }

  @Post('chat')
  chat(@Body() body: { prompt?: string }) {
    const prompt = body?.prompt?.trim();
    if (!prompt) {
      throw new BadRequestException('prompt is required');
    }
    return this.ollama.chat(prompt);
  }
}
