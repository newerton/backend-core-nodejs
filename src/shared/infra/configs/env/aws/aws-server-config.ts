import { env } from '../init';

export class AWSServerConfig {
  public static readonly DEFAULT_REGION: string = env
    .get('AWS_DEFAULT_REGION')
    .required()
    .asString();

  public static readonly ACCESS_KEY_ID: string = env
    .get('AWS_ACCESS_KEY_ID')
    .default('')
    .asString();

  public static readonly SECRET_ACCESS_KEY: string = env
    .get('AWS_SECRET_ACCESS_KEY')
    .default('')
    .asString();
}
