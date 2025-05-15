import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Включаем встроенное логирование NestJS
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Включаем CORS с настройками (можно указать origin из .env)
  app.enableCors({
    origin: app.get(ConfigService).get('app.FRONTEND_URL') || '*',
    credentials: true,
  });

  // Глобальная валидация DTO через ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Глобальный фильтр ошибок
  app.useGlobalFilters(new AllExceptionsFilter());

  // TODO: Можно добавить глобальный фильтр ошибок, если потребуется кастомная обработка

  const configService = app.get(ConfigService);
  const port = configService.get('app.port');
  const config = new DocumentBuilder()
    .setTitle('api quiz app')
    .setDescription('quiz app api description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('quiz')
    .setContact('Ваше Имя', 'https://ваш-сайт.ru', 'email@site.ru')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Local server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port ?? 3000);
}
bootstrap();
