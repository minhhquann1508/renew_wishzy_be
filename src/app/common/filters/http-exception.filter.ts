import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'An error occurred';
    let errors = null;

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      errors = (exceptionResponse as any).errors || null;
    } else {
      message = exceptionResponse;
    }

    response.status(status).json({
      success: false,
      data: errors,
      message: Array.isArray(message) ? message[0] : message,
      url: request.url,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    // Log chi tiết lỗi để debug
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Log thêm thông tin exception
    if (exception instanceof Error) {
      this.logger.error(`Error Name: ${exception.name}`);
      this.logger.error(`Error Message: ${exception.message}`);
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
      url: request.url,
    });
  }
}
