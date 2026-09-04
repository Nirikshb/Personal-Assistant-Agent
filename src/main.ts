import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { validateEnv } from './config/env.js';

async function bootstrap() {
  const env = validateEnv(process.env);
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(env.PORT);
}
await bootstrap();
