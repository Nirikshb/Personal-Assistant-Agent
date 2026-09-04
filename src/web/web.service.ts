import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium } from 'playwright';

const JINA_PREFIX = 'https://r.jina.ai/';
const MAX_PAGE_CHARS = 15000;

@Injectable()
export class WebService {
  constructor(private readonly config: ConfigService) {}

  status() {
    return {
      tavily: Boolean(this.config.get<string>('TAVILY_API_KEY')),
      brave: Boolean(this.config.get<string>('BRAVE_API_KEY')),
      jina: true,
      playwright: true,
      browserless: Boolean(this.config.get<string>('BROWSERLESS_WS')),
    };
  }

  async search(query: string, max = 8) {
    const tavily = this.config.get<string>('TAVILY_API_KEY') ?? '';
    const brave = this.config.get<string>('BRAVE_API_KEY') ?? '';
    if (tavily) {
      return {
        provider: 'tavily',
        results: await this.searchTavily(query, max),
      };
    }
    if (brave) {
      return { provider: 'brave', results: await this.searchBrave(query, max) };
    }
    throw new ServiceUnavailableException(
      'Set TAVILY_API_KEY or BRAVE_API_KEY in .env',
    );
  }

  async readPage(url: string) {
    let text = await this.readJina(url);
    let source = 'jina';
    if (text.length < 200) {
      try {
        text = await this.readPlaywright(url);
        source = this.config.get<string>('BROWSERLESS_WS')
          ? 'browserless'
          : 'playwright';
      } catch {
        if (!text) {
          throw new ServiceUnavailableException(
            'Jina returned little text and Playwright failed',
          );
        }
      }
    }
    return {
      url,
      source,
      text: text.slice(0, MAX_PAGE_CHARS),
    };
  }

  private async searchTavily(query: string, max: number) {
    const apiKey = this.config.get<string>('TAVILY_API_KEY') ?? '';
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: Math.min(Math.max(max, 1), 10),
        include_answer: false,
      }),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Tavily search failed (${response.status})`,
      );
    }
    const data = (await response.json()) as {
      results?: { title?: string; url?: string; content?: string }[];
    };
    return (data.results ?? []).map((row) => ({
      title: row.title ?? '',
      url: row.url ?? '',
      snippet: row.content ?? '',
    }));
  }

  private async searchBrave(query: string, max: number) {
    const apiKey = this.config.get<string>('BRAVE_API_KEY') ?? '';
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(Math.min(Math.max(max, 1), 10)));
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Brave search failed (${response.status})`,
      );
    }
    const data = (await response.json()) as {
      web?: {
        results?: { title?: string; url?: string; description?: string }[];
      };
    };
    return (data.web?.results ?? []).map((row) => ({
      title: row.title ?? '',
      url: row.url ?? '',
      snippet: row.description ?? '',
    }));
  }

  private async readJina(targetUrl: string): Promise<string> {
    const headers: Record<string, string> = {
      Accept: 'text/plain',
    };
    const jinaKey = this.config.get<string>('JINA_API_KEY') ?? '';
    if (jinaKey) {
      headers.Authorization = `Bearer ${jinaKey}`;
    }
    const response = await fetch(`${JINA_PREFIX}${targetUrl}`, { headers });
    if (!response.ok) {
      return '';
    }
    return (await response.text()).trim();
  }

  private async readPlaywright(targetUrl: string): Promise<string> {
    const ws = this.config.get<string>('BROWSERLESS_WS') ?? '';
    const browser = ws
      ? await chromium.connectOverCDP(ws)
      : await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      const text = await page.locator('body').innerText();
      return text.trim();
    } finally {
      await browser.close();
    }
  }
}
