import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { OllamaService } from './ollama.service.js';

describe('OllamaService', () => {
  let service: OllamaService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OllamaService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'OLLAMA_BASE_URL') {
                return 'http://127.0.0.1:11434';
              }
              if (key === 'OLLAMA_MODEL') {
                return 'llama3.2';
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get(OllamaService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists models from /api/tags', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: 'llama3.2' }] }),
    });

    await expect(service.health()).resolves.toEqual({
      ok: true,
      models: ['llama3.2'],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:11434/api/tags',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends a non-streaming chat request', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { role: 'assistant', content: 'Hello' },
      }),
    });

    await expect(service.chat('hi')).resolves.toEqual({
      model: 'llama3.2',
      reply: 'Hello',
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toMatchObject({
      model: 'llama3.2',
      stream: false,
      messages: [{ role: 'user', content: 'hi' }],
    });
  });

  it('throws when Ollama is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
