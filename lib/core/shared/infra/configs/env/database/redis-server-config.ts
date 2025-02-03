import { env } from '../init';

export class RedisServerConfig {
  public static readonly HOST: string = env
    .get('CACHE_HOST')
    .default('localhost')
    .required()
    .asString();

  public static readonly PORT: number = env
    .get('CACHE_PORT')
    .default(6379)
    .required()
    .asInt();
}
