import { CoreApiResponse } from '../../../../../core/shared/domain/api';
import { CodeDescription } from '../../../../../core/shared/domain/errors';

export type HttpExceptionFilterProperties = Error &
  CodeDescription & {
    details: Array<{ [key: string]: string }>;
  };

export const handleJSONException = (
  error: HttpExceptionFilterProperties,
): CoreApiResponse<unknown> => {
  const code = typeof error.code === 'number' ? error.code : 500;
  return CoreApiResponse.error(
    code,
    error.error,
    error.message,
    error.details ? error.details : [],
  );
};
