import { Injectable } from '@nestjs/common';
import { GmailService } from '../gmail/gmail.service.js';
import { OllamaService } from '../ollama/ollama.service.js';
import { WebService } from '../web/web.service.js';

@Injectable()
export class AgentService {
  constructor(
    private readonly gmail: GmailService,
    private readonly ollama: OllamaService,
    private readonly web: WebService,
  ) { }
  async webSearch(query: string) {
    return this.web.search(query);
  }
  async webRead(url: string) {
    return this.web.readPage(url);
  }
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
  async run(message: string) {
    return this.ollama.chat(
      [
        'You are an AI assistant.',
        'You have access to a web search tool.',
        'For now, do not execute tools.',
        'Determine whether the user request would require web search.',
        '',
        `User: ${message}`,
      ].join('\n'),
    );
  }
}
