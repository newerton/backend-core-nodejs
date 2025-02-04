import { env } from '../init';

export class CacheServerConfig {
  public static readonly ENCRIPTION_KEY: string = env
    .get('CACHE_ENCRIPTION_KEY')
    .required()
    .asString();

  public static readonly ENCRIPTION_IV: string = env
    .get('CACHE_ENCRIPTION_IV')
    .required()
    .asString();
}
