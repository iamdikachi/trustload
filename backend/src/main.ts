import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TrustLoad API')
    .setDescription(
      'Transparent group money for pooled buying trips abroad. Vendors fund a PayPal pot, AI verifies supplier invoices before staged payouts, then splits goods and costs fairly per vendor.',
    )
    .setVersion('1.0.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`TrustLoad API listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Swagger OpenAPI UI available at http://localhost:${port}/docs`,
    'Bootstrap',
  );
}
void bootstrap();
