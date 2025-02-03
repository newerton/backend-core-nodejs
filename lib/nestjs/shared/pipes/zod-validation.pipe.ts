import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Schema, ZodError } from 'zod';

import { CreateValidationSchema } from '../validators/zod';

export type ZodValidationType = {
  message: string;
  details: Array<{
    code: string;
    expected: string;
    received: string;
    path: (string | number)[];
    message: string;
  }>;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly schema: Schema;

  constructor(schemaFactory: CreateValidationSchema) {
    this.schema = schemaFactory.createSchema();
  }

  async transform(message: any): Promise<any> {
    try {
      await this.schema.parse(message);
    } catch (err) {
      let errors = {
        message: err?.message || err,
        details: err,
      };

      if (err instanceof ZodError) {
        const { issues } = err;
        if (issues.length > 0) {
          errors = {
            message: issues[0].message,
            details: issues,
          };
        }
      }

      throw new ZodValidationException(errors);
    }

    return message;
  }
}

export class ZodValidationException extends HttpException {
  constructor(err: ZodValidationType) {
    super({ ...err }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
