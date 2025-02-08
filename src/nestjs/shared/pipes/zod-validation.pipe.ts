import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
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

class ZodValidationBasePipe {
  private readonly schema: Schema;

  constructor(schemaFactory: CreateValidationSchema) {
    this.schema = schemaFactory.createSchema();
  }

  protected validate(message: any) {
    try {
      this.schema.parse(message);
      return null;
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

      return errors;
    }
  }
}

@Injectable()
export class ZodValidationHttpPipe
  extends ZodValidationBasePipe
  implements PipeTransform
{
  transform(value: any): any {
    const errors = this.validate(value);
    if (errors) {
      throw new ZodValidationHttpException(errors);
    }
    return value;
  }
}

@Injectable()
export class ZodValidationRpcPipe
  extends ZodValidationBasePipe
  implements PipeTransform
{
  transform(value: any): any {
    const errors = this.validate(value);
    if (errors) {
      throw new RpcException({ ...errors, status: 'error', code: 422 });
    }
    return value;
  }
}

export class ZodValidationHttpException extends HttpException {
  constructor(err: ZodValidationType) {
    super({ ...err }, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class ZodValidationRpcException extends RpcException {
  constructor(err: ZodValidationType) {
    super({ ...err, status: 'error', code: 422 });
  }
}
