import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { isObserveEnabled, validateEnv } from './config/env.js';
import { OllamaModule } from './ollama/ollama.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const env = validateEnv(process.env);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    OllamaModule,
    ...(isObserveEnabled(env)
      ? [
          ObserveModule.forRoot({
            appKey: env.NEST_OBSERVE_APP_KEY,
            appSecret: env.NEST_OBSERVE_APP_SECRET,
            serviceId: env.NEST_OBSERVE_SERVICE_ID,
          }),
        ]
      : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
