import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

import { Exception } from '../../../../core/shared/domain/exceptions';
import {
  ZodValidationHttpException,
  ZodValidationType,
} from '../../pipes/zod-validation.pipe';

@Catch(ZodValidationHttpException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ZodValidationType;

    Logger.error(JSON.stringify(exceptionResponse));

    throw Exception.new({
      code: status,
      message: this.formatValidationMessage(exceptionResponse.details),
      data: exceptionResponse,
    });
  }

  formatValidationMessage(errors: ZodValidationType['details']) {
    const paths = [...new Set(errors.map((error) => error.path[0]))];
    const messages = [...new Set(errors.map((error) => error.message))];

    if (paths.length === 0) return 'Validation error';
    if (paths.length === 1 && paths[0]) return `Validation: ${paths[0]}`;
    if (paths.length === 1 && !paths[0])
      return `Validation: ${messages.join(', ')}`;

    const last = paths.pop();
    return `Validation: ${paths.join(', ')}${paths.length > 1 ? ',' : ''} and ${last}`;
  }
}
