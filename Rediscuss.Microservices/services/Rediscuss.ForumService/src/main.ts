import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { MassTransitServer } from './mass-transit-server.strategy';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigType } from '@nestjs/config';
import rabbitmqConfig from './config/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Rediscuss Forum Api')
    .setDescription('API for Rediscuss Forum Application')
    .setVersion('1.0')
    .addTag('rediscuss-forum')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, await documentFactory());

  const rmq = app.get<ConfigType<typeof rabbitmqConfig>>(rabbitmqConfig.KEY);
  const user = rmq.user;
  const password = rmq.password;
  const host = rmq.host;
  const port = rmq.port;

  const urls = `amqp://${user}:${password}@${host}:${port}/`;
  app.connectMicroservice({
    strategy: new MassTransitServer({
       urls: [urls],
      queue: rmq.queue,
      noAck: false, 
      queueOptions: {
        durable: true,
      },
    }),
  });


  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
