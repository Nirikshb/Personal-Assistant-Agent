import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OllamaService {
  constructor(private readonly config: ConfigService) {}

  async health(): Promise<{ ok: true; models: string[] }> {
    const data = await this.request(`${this.baseUrl()}/api/tags`);
    const models = Array.isArray(data.models)
      ? data.models
          .map((model: { name?: string }) => model.name)
          .filter(Boolean)
      : [];

    return { ok: true, models };
  }

  async chat(prompt: string): Promise<{ model: string; reply: string }> {
    const model = this.config.get<string>('OLLAMA_MODEL') ?? '';
    if (!model) {
      throw new ServiceUnavailableException('OLLAMA_MODEL is not set');
    }

    const data = await this.request(`${this.baseUrl()}/api/chat`, {
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const reply = data.message?.content;
    if (typeof reply !== 'string' || reply.length === 0) {
      throw new ServiceUnavailableException('Ollama returned an empty reply');
    }

    return { model, reply };
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('OLLAMA_BASE_URL') ?? 'http://127.0.0.1:11434'
    );
  }

  private async request(
    url: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let response: Response;
    try {
      response = await fetch(url, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ServiceUnavailableException(
        `Cannot reach Ollama at ${this.baseUrl()}`,
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Ollama request failed (${response.status})`,
      );
    }

    return response.json();
  }
}
