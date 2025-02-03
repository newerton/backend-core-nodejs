import { env } from '../init';

export class DatabaseServerConfig {
  public static readonly DIALECT: string = env
    .get('DB_DIALECT')
    .required()
    .asString();

  public static readonly HOST: string = env
    .get('DB_HOST')
    .required()
    .asString();

  public static readonly PORT: number = env
    .get('DB_PORT')
    .required()
    .asPortNumber();

  public static readonly USER: string = env
    .get('DB_USER')
    .required()
    .asString();

  public static readonly PASSWORD: string = env
    .get('DB_PASSWORD')
    .required()
    .asString();

  public static readonly DATABASE: string = env
    .get('DB_DATABASE')
    .required()
    .asString();

  public static readonly LOGGING: boolean = env
    .get('DB_LOGGING')
    .required()
    .asBool();
}
