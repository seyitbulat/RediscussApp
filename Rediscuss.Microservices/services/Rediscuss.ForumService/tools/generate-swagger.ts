import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

(async () => {
  process.env.GENERATE_SWAGGER = 'true';

  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Rediscuss Forum Api')
    .setDescription('Forum API for Rediscuss Application')
    .setVersion('1.0')
    .addTag('rediscuss-forum')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outDir = join(process.cwd(), 'docs');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'openapi.json');
  writeFileSync(outFile, JSON.stringify(document, null, 2));
  await app.close();
  console.log(`Swagger JSON written to ${outFile}`);
})();
