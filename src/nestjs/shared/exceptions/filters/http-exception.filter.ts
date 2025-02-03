import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CoreApiResponse } from '../../../../core/shared/domain/api';
import { Code, CodeDescription } from '../../../../core/shared/domain/errors';
import { Exception } from '../../../../core/shared/domain/exceptions';
import { ApiServerConfig } from '../../../../core/shared/infra/configs';

type HttpExceptionFilterProperties = Error &
  CodeDescription & {
    details: Array<{ [key: string]: string }>;
  };

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

    errorResponse = this.handleJSONException(
      error as HttpExceptionFilterProperties,
      errorResponse,
    );
    errorResponse = this.handleNestError(error, errorResponse);
    errorResponse = this.handleCoreException(error, errorResponse);
    errorResponse = this.handleAxiosException(error, errorResponse);

    if (ApiServerConfig.LOG_ENABLE && request) {
      const message: string =
        `Method: ${request.method}; ` +
        `Path: ${request.path}; ` +
        `Error: ${errorResponse.error}; ` +
        `Message: ${errorResponse.message}`;

      Logger.error(message);
    }

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

    if (type === 'rpc') {
      throw Exception.new({
        code: errorResponse.code,
        message: errorResponse.message,
        data: { errorResponse },
      });
    }
    response.status(status).send(errorResponse);
  }

  private handleNestError(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof HttpException) {
      const findCode =
        Exception.findCodeByCodeValue(error.getStatus()) ||
        Code.INTERNAL_SERVER_ERROR;
      errorResponse = CoreApiResponse.error(
        findCode.code < 100 ? Code.INTERNAL_SERVER_ERROR.code : findCode.code,
        findCode.error || Code.INTERNAL_SERVER_ERROR.error,
        error.message,
        undefined,
      );
    }
    return errorResponse;
  }

  private handleCoreException(
    error: Error,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error instanceof Exception) {
      errorResponse = CoreApiResponse.error(
        error.code,
        error.error,
        error.message,
        error.data ? [error.data] : [],
      );
    }

    return errorResponse;
  }

  private handleAxiosException(
    error: any,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (error.name === 'AxiosError') {
      const findCode =
        Exception.findCodeByCodeValue(Number(error.response.status)) ||
        Code.INTERNAL_SERVER_ERROR;

      const baseUrl = error.config.baseURL;
      if (baseUrl.includes('ibm.com')) {
        let resultMessage = 'IBM error message not found';

        if (
          'messageDescription' in error.response.data &&
          'messageId' in error.response.data
        ) {
          resultMessage = `${error.response.data.messageId} ${error.response.data.messageDescription}`;
        }

        if ('error_description' in error.response.data) {
          resultMessage = error.response.data.error_description;
        }

        if ('detail' in error.response.data) {
          resultMessage = error.response.data.detail;
        }

        return CoreApiResponse.error(
          Number(error.response.status),
          findCode.error,
          resultMessage,
          [error.config],
        );
      }

      delete error.config.baseURL;
      delete error.config.method;
      delete error.config.headers;

      errorResponse = CoreApiResponse.error(
        findCode.code,
        findCode.error,
        String(error.response.data.message) || findCode.message,
        [error.config],
      );
    }
    return errorResponse;
  }

  private handleJSONException(
    error: HttpExceptionFilterProperties,
    errorResponse: CoreApiResponse<unknown>,
  ): CoreApiResponse<unknown> {
    if (typeof error === 'object') {
      const code = typeof error.code === 'number' ? error.code : 500;
      errorResponse = CoreApiResponse.error(
        code,
        error.error,
        error.message,
        error.details ? error.details : [],
      );
    }

    return errorResponse;
  }
}
