import { CoreApiResponse } from '../../../../../core/shared/domain/api';
import { Exception } from '../../../../../core/shared/domain/exceptions';

export const handleCoreException = (
  error: Exception<unknown>,
): CoreApiResponse<unknown> => {
  return CoreApiResponse.error(
    error.code,
    error.error,
    error.message,
    error.data ? [error.data] : [],
  );
};
