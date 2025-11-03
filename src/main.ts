import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger, ValidationError, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import { TransformInterceptor } from './app/common/interceptors/transform.interceptor';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './app/common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

declare const module: any;

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Cookie Parser
  app.use(cookieParser());

  // Get configuration values with defaults
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');
  const swaggerEnabled = configService.get<boolean>(
    'SWAGGER_ENABLED',
    environment === 'development',
  );

  // API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Response Transform Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Exception Filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = validationErrors.map((error) => {
          const constraints = error.constraints ? Object.values(error.constraints) : [];
          return {
            property: error.property,
            message: constraints.length > 0 ? constraints[0] : 'Invalid value',
            constraints: constraints,
            value: error.value,
          };
        });

        return new BadRequestException({
          message: 'Validation failed',
          errors: errors,
        });
      },
    }),
  );

  // Swagger Documentation
  if (swaggerEnabled) {
    setupSwagger(app);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  }

  // CORS
  const allowedOrigins = configService
    .get<string>(
      'ALLOWED_ORIGINS',
      'http://localhost:3000,http://localhost:3001,http://localhost:5173',
    )
    .split(',');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      // In development, allow all localhost origins
      if (environment === 'development' && origin.startsWith('http://localhost')) {
        callback(null, true);
        return;
      }

      // Check against allowed origins list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(port);

  logger.log(`Application is running in ${environment} mode on port ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
