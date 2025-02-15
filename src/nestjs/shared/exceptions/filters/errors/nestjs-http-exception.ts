import { HttpException } from '@nestjs/common';

import { CoreApiResponse } from '../../../../../core/shared/domain/api';
import { Code } from '../../../../../core/shared/domain/errors';
import { Exception } from '../../../../../core/shared/domain/exceptions';

export const handleNestHttpException = (
  error: HttpException,
): CoreApiResponse<unknown> => {
  const findCode =
    Exception.findCodeByCodeValue(error.getStatus()) ||
    Code.INTERNAL_SERVER_ERROR;
  return CoreApiResponse.error(
    findCode.code < 100 ? Code.INTERNAL_SERVER_ERROR.code : findCode.code,
    findCode.error || Code.INTERNAL_SERVER_ERROR.error,
    error.message,
    [],
  );
};
