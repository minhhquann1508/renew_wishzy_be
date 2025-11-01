import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    return next.handle().pipe(
      map((data) => {
        // If data already has a message property, use it
        const message = data?.message || 'Success';

        // If data has a message property, extract it and use the rest as data
        let responseData = data;
        if (data && typeof data === 'object' && 'message' in data) {
          const { message: _, ...rest } = data;
          responseData = Object.keys(rest).length === 0 ? null : rest;
        }

        return {
          success: true,
          data: responseData,
          message,
          url,
        };
      }),
    );
  }
}
