import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationFactory } from './tools/postgres/migration/migration.factory';
import { ValidationPipe } from '@nestjs/common';
import { AuthenticationCache } from './auth/cache/authentication.cache';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const migrator = await app.get(MigrationFactory).create('general');
  await migrator.up();
  await app.get(AuthenticationCache).boot();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Blogs API')
    .setDescription('API documentation for the Blogs App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.setGlobalPrefix('api').init();
  await app.listen(3000);
}
bootstrap();
