import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

export class AppValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      ...options,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors
          .map((error) => AppValidationPipe.formatError(error))
          .filter(Boolean);
        return new BadRequestException({
          statusCode: 400,
          message: messages,
          error: 'Bad Request',
        });
      },
    });
  }

  private static formatError(error: ValidationError): string | null {
    if (error.constraints) {
      return Object.values(error.constraints)[0];
    }
    if (error.children && error.children.length > 0) {
      return AppValidationPipe.formatError(error.children[0]);
    }
    return null;
  }
}
