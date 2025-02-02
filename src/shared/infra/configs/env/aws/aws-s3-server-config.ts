import { env } from '../init';

export class AWSS3ServerConfig {
  public static readonly BUCKET_NAME: string = env
    .get('AWS_BUCKET_NAME')
    .required()
    .asString();

  public static readonly BUCKET_HOST: string = env
    .get('AWS_BUCKET_HOST')
    .required()
    .asString();
}
