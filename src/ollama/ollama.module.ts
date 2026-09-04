import { Module } from '@nestjs/common';
import { OllamaController } from './ollama.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({
  controllers: [OllamaController],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
