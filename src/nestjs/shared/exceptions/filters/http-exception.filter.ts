import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { handleAxiosException } from './errors/axios-errors';
import { handleCoreException } from './errors/core-exception';
import {
  HttpExceptionFilterProperties,
  handleJSONException,
} from './errors/json-exception';
import { handleNestHttpException } from './errors/nestjs-http-exception';
import { CoreApiResponse } from '../../../../core/shared/domain/api';
import { Code } from '../../../../core/shared/domain/errors';
import { Exception } from '../../../../core/shared/domain/exceptions';
import { ApiServerConfig } from '../../../../core/shared/infra/configs/env/api/api-server-config';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const request: Request = host.switchToHttp().getRequest();
    const response: Response = host.switchToHttp().getResponse<Response>();
    const type = host.getType();

    if (['dev', 'develop', 'development'].includes(ApiServerConfig.ENV)) {
      console.dir(error, { depth: 5 });
    }

    let errorResponse: CoreApiResponse<unknown> = CoreApiResponse.error(
      Code.INTERNAL_SERVER_ERROR.code,
      Code.INTERNAL_SERVER_ERROR.error,
      error.message,
    );

    if (error instanceof HttpException) {
      errorResponse = handleNestHttpException(error);
    } else if (error instanceof Exception) {
      errorResponse = handleCoreException(error);
    } else if (typeof error === 'object') {
      errorResponse = handleJSONException(
        error as HttpExceptionFilterProperties,
      );
    } else if ((error as any).name === 'AxiosError') {
      errorResponse = handleAxiosException(error);
    }

    if (ApiServerConfig.LOG_ENABLE && request) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.error}; ` +
        `Message: ${errorResponse.message}`;

      Logger.error(message);
    }

    const status = this.getErrorStatus(errorResponse);

    if (['graphql', 'ws', 'rpc'].includes(type)) {
      throw Exception.new({
        code: errorResponse.code,
        message: errorResponse.message,
        data: errorResponse.details,
      });
    }

    if (['http', 'express'].includes(type)) {
      response.status(status).json(errorResponse);
    }
  }

  private getErrorStatus(errorResponse: CoreApiResponse<unknown>): number {
    const validRanges = [
      [100, 511],
      [1000, 1004],
    ];
    const validRange = validRanges.find(
      ([start, end]) =>
        start <= errorResponse.code && errorResponse.code <= end,
    );
    let status = validRange ? errorResponse.code : 500;
    if (errorResponse.code > 511) {
      status = 500;
    }

    return status;
  }
}
