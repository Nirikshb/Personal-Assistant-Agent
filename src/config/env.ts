import 'dotenv/config';

export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  NEST_OBSERVE_APP_KEY: string;
  NEST_OBSERVE_APP_SECRET: string;
  NEST_OBSERVE_SERVICE_ID: string;
};

function readString(
  config: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = config[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  return String(value);
}

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const PORT = Number(config.PORT ?? 3000);
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    NODE_ENV: readString(config, 'NODE_ENV', 'development'),
    PORT,
    OLLAMA_BASE_URL: readString(
      config,
      'OLLAMA_BASE_URL',
      'http://127.0.0.1:11434',
    ),
    OLLAMA_MODEL: readString(config, 'OLLAMA_MODEL', ''),
    NEST_OBSERVE_APP_KEY: readString(config, 'NEST_OBSERVE_APP_KEY', ''),
    NEST_OBSERVE_APP_SECRET: readString(config, 'NEST_OBSERVE_APP_SECRET', ''),
    NEST_OBSERVE_SERVICE_ID: readString(
      config,
      'NEST_OBSERVE_SERVICE_ID',
      'ai-assistant',
    ),
  };
}

export function isObserveEnabled(
  env: Pick<AppEnv, 'NEST_OBSERVE_APP_KEY' | 'NEST_OBSERVE_APP_SECRET'>,
): boolean {
  return Boolean(env.NEST_OBSERVE_APP_KEY && env.NEST_OBSERVE_APP_SECRET);
}
