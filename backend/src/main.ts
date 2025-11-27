import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const httpAdapter = app.get(HttpAdapterHost);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new AppValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`AI Receptionist backend running on port ${port}`);
}

bootstrap();
