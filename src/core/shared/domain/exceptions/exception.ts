import { Code, CodeDescription } from '../errors/code';
import { Optional } from '../types/common-types';

export type CreateExceptionPayload<T> = {
  code: number;
  message?: string;
  data?: T;
};

export class Exception<T> extends Error {
  readonly code: number;

  readonly error: string;

  readonly data: Optional<T>;

  constructor(code: number, message?: string, data?: T) {
    super();
    this.name = this.constructor.name;

    const error = Exception.findCodeByCodeValue(code);
    if (!error) {
      this.code = Code.INTERNAL_SERVER_ERROR.code;
      this.error = Code.INTERNAL_SERVER_ERROR.message;
      this.message = 'Status code not found';
    } else {
      this.code = error.code;
      this.error = error.error;
      this.message = message || error.message;
      this.data = data;
    }

    Error.captureStackTrace(this, this.constructor);
  }

  static new<T>(payload: CreateExceptionPayload<T>): Exception<T> {
    return new Exception(payload.code, payload.message, payload.data);
  }

  static findCodeByCodeValue = (
    codeValue: number,
  ): CodeDescription | undefined =>
    Object.values(Code).find(({ code }) => code === codeValue) as
      | CodeDescription
      | undefined;
}
