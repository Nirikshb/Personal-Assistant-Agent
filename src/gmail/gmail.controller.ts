import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { GmailService } from './gmail.service.js';

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmail: GmailService) {}

  @Get('status')
  status() {
    return this.gmail.status();
  }

  @Get('connect')
  @Redirect()
  connect() {
    return { url: this.gmail.authUrl(), statusCode: 302 };
  }

  @Get('callback')
  callback(@Query('code') code?: string) {
    if (!code) {
      throw new BadRequestException('code is required');
    }
    return this.gmail.handleCallback(code);
  }

  @Get('messages')
  messages(@Query('max') max?: string) {
    const parsed = Number(max ?? 10);
    return this.gmail.listRecent(Number.isFinite(parsed) ? parsed : 10);
  }
}
