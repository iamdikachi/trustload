import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
