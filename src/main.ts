import './otel';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as crypto from 'crypto';

// Polyfill for Node.js 18 to support global crypto (required by some NestJS libraries)
if (!global.crypto) {
  (global as any).crypto = crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log("process.env.FRONTEND_URL ==> ", process.env.FRONTEND_URL)
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
