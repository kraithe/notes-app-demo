import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DomainEventBus } from '../events/domain-event-bus.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private readonly eventBus: DomainEventBus) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        const res = http.getResponse<Response>();
        this.eventBus.emitApi({
          method: req.method,
          path: req.originalUrl ?? req.url,
          statusCode: res.statusCode,
          durationMs: Date.now() - now,
        });
      }),
      catchError((err: unknown) => {
        const res = http.getResponse<Response>();
        this.eventBus.emitApi({
          method: req.method,
          path: req.originalUrl ?? req.url,
          statusCode: res.statusCode ?? 500,
          durationMs: Date.now() - now,
          errorName: err instanceof Error ? err.name : 'UnknownError',
          errorMessage: err instanceof Error ? err.message : String(err),
        });
        return throwError(() => err);
      }),
    );
  }
}
