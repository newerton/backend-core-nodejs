import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const IGNORED_ROUTES: string[] = ['/health'];

@Injectable()
export class HttpLoggingApolloFederationInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const switchToHttp: HttpArgumentsHost = context.switchToHttp();
    const request: Request = switchToHttp.getRequest();
    const contextType: string = context.getType();
    const requestStartDate: number = Date.now();

    if (contextType === 'graphql') {
      const source: string =
        context.getArgByIndex(3).operation.selectionSet.loc.source.body;

      const code = source.replace(/\s+/g, ' ').trim();

      const requestFinishDate: number = Date.now();
      const message: string =
        `GraphQL: ${code}; ` +
        `SpentTime: ${requestFinishDate - requestStartDate}ms`;

      return next
        .handle()
        .pipe(
          tap(() =>
            Logger.log(message, HttpLoggingApolloFederationInterceptor.name),
          ),
        );
    }

    if (
      request.method &&
      request.path &&
      !IGNORED_ROUTES.includes(request.path as string)
    ) {
      return next.handle().pipe(tap(this.tapLogger(request, requestStartDate)));
    } else {
      return next.handle();
    }
  }

  public tapLogger(request: Request, requestStartDate: number) {
    return (): void => {
      const message: string = this.message(request, requestStartDate);
      Logger.log(message, HttpLoggingApolloFederationInterceptor.name);
    };
  }

  public message(request: Request, requestStartDate: number) {
    const requestFinishDate: number = Date.now();
    const message: string =
      `Method: ${request.method}; ` +
      `Path: ${request.path}; ` +
      `SpentTime: ${requestFinishDate - requestStartDate}ms`;

    return message;
  }
}
