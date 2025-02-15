import { CoreApiResponse } from '../../../../../core/shared/domain/api';
import { Code } from '../../../../../core/shared/domain/errors';
import { Exception } from '../../../../../core/shared/domain/exceptions';

type HandleAxiosExceptionProps = {
  name: string;
  response: {
    status: number;
    data: {
      message: string;
      messageDescription?: string;
      messageId?: string;
      error_description?: string;
      detail?: string;
    };
  };
  config: {
    baseURL: string;
    method: string;
    headers: Record<string, string>;
  };
};

export const handleAxiosException = (
  error: HandleAxiosExceptionProps,
): CoreApiResponse<unknown> => {
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

    return CoreApiResponse.error(
      findCode.code,
      findCode.error,
      String(error.response.data.message) || findCode.message,
      [error.config],
    );
  }
};
