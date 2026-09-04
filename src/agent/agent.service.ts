import { Injectable } from '@nestjs/common';
import { GmailService } from '../gmail/gmail.service.js';
import { OllamaService } from '../ollama/ollama.service.js';

@Injectable()
export class AgentService {
  constructor(
    private readonly gmail: GmailService,
    private readonly ollama: OllamaService,
  ) {}

  async inboxBrief(max = 10) {
    const { messages } = await this.gmail.listRecent(max);
    if (messages.length === 0) {
      return { messages, brief: 'No recent messages.' };
    }

    const listed = messages
      .map(
        (msg, index) =>
          `${index + 1}. From: ${msg.from}\n   Subject: ${msg.subject}\n   Snippet: ${msg.snippet}`,
      )
      .join('\n');

    const { model, reply } = await this.ollama.chat(
      [
        'You are a professional executive assistant.',
        'Classify each email as urgent, important, routine, or FYI.',
        'Then write a short executive summary of what needs attention.',
        'Use fluent professional English. Do not invent emails that are not listed.',
        '',
        listed,
      ].join('\n'),
    );

    return { model, messages, brief: reply };
  }
}
