import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly';
const TOKEN_FILE = '.gmail-tokens.json';

@Injectable()
export class GmailService {
  constructor(private readonly config: ConfigService) {}

  async status() {
    const tokens = await this.loadTokens();
    return {
      configured: this.hasClient(),
      connected: Boolean(tokens?.refresh_token),
    };
  }

  authUrl(): string {
    return this.oauthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [GMAIL_READONLY],
    });
  }

  async handleCallback(code: string): Promise<{ ok: true }> {
    const { tokens } = await this.oauthClient().getToken(code);
    if (!tokens.refresh_token) {
      throw new ServiceUnavailableException(
        'Google did not return a refresh token. Remove this app from https://myaccount.google.com/permissions and connect again.',
      );
    }
    await this.saveTokens(tokens);
    return { ok: true };
  }

  async listRecent(max = 10) {
    const auth = await this.authedClient();
    const gmail = google.gmail({ version: 'v1', auth });
    const listed = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(Math.max(max, 1), 20),
    });
    const messages = [];

    for (const row of listed.data.messages ?? []) {
      if (!row.id) {
        continue;
      }
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: row.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject'],
      });
      const headers = full.data.payload?.headers ?? [];
      messages.push({
        id: row.id,
        from: header(headers, 'from'),
        subject: header(headers, 'subject'),
        snippet: full.data.snippet ?? '',
      });
    }

    return { messages };
  }

  private hasClient(): boolean {
    return Boolean(
      this.config.get<string>('GOOGLE_CLIENT_ID') &&
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  private oauthClient() {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID') ?? '';
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET') ?? '';
    const redirectUri =
      this.config.get<string>('GOOGLE_REDIRECT_URI') ??
      'http://localhost:3000/gmail/callback';
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set',
      );
    }
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  private async authedClient() {
    const client = this.oauthClient();
    const tokens = await this.loadTokens();
    if (!tokens?.refresh_token) {
      throw new ServiceUnavailableException(
        'Gmail is not connected. Open GET /gmail/connect first.',
      );
    }
    client.setCredentials(tokens);
    return client;
  }

  private tokenPath(): string {
    return join(process.cwd(), TOKEN_FILE);
  }

  private async loadTokens(): Promise<{ refresh_token?: string } | null> {
    try {
      const raw = await readFile(this.tokenPath(), 'utf8');
      return JSON.parse(raw) as { refresh_token?: string };
    } catch {
      return null;
    }
  }

  private async saveTokens(tokens: object): Promise<void> {
    await writeFile(this.tokenPath(), JSON.stringify(tokens, null, 2), 'utf8');
  }
}

function header(
  headers: { name?: string | null; value?: string | null }[],
  name: string,
): string {
  const found = headers.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase(),
  );
  return found?.value ?? '';
}
