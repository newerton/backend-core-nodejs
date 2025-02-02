import { Options } from 'pino-http';

import { Exception } from '../../domain/exceptions/exception';
import { ApiServerConfig } from '../configs/env';

export const pinoHttoLogging: Options = {
  name: `pino-logger`,
  level: ApiServerConfig.ENV !== 'production' ? 'debug' : 'info',
  customLogLevel: (_, res, err?: Error) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }

    return 'silent';
  },
  customSuccessMessage: function (_, res) {
    const findStatusCode = Exception.findCodeByCodeValue(
      Number(res.statusCode),
    );
    return res.statusCode >= 400 && res.statusCode < 500
      ? `${res.statusCode} ${findStatusCode?.message} `
      : `${res.statusCode} ${findStatusCode?.message}`.trim();
  },
  customErrorMessage: function (_, res, error: Error) {
    const findStatusCode = Exception.findCodeByCodeValue(
      Number(res.statusCode),
    );
    return `${res.statusCode} ${findStatusCode?.message} ${
      error.message ? `- ${error.message}` : ''
    }`;
  },
  redact: ['document', 'email', 'password', 'password_confirmation'],
  transport:
    ApiServerConfig.ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: true,
          },
        }
      : undefined,
  // serializers: {
  //   req(req: { body: unknown }): { body: unknown } {
  //     req.body = req.body;

  //     return req;
  //   },
  // },
  formatters: {
    level(level: string) {
      return { level };
    },
  },
};
