import { env } from '../init';

export class RabbitMQServerConfig {
  public static readonly RABBITMQ_PROTOCOL: string = env
    .get('RABBITMQ_PROTOCOL')
    .required()
    .asString();

  public static readonly RABBITMQ_HOST: string = env
    .get('RABBITMQ_HOST')
    .required()
    .asString();

  public static readonly RABBITMQ_PORT: number = env
    .get('RABBITMQ_PORT')
    .required()
    .asPortNumber();

  public static readonly RABBITMQ_USER: string = env
    .get('RABBITMQ_USER')
    .required()
    .asString();

  public static readonly RABBITMQ_PASSWORD: string = env
    .get('RABBITMQ_PASSWORD')
    .required()
    .asString();

  public static readonly RABBITMQ_CERTIFICATE_AUTH: string = env
    .get('RABBITMQ_CERTIFICATE_AUTH')
    .default('')
    .asString();
}
