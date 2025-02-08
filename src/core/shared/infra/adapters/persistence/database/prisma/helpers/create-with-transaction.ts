import { PrismaClient } from '@prisma/client';

import { Code } from '../../../../../../domain/errors/code';
import { Exception } from '../../../../../../domain/exceptions/exception';

type Model = {
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

type PrismaCreateWithTransactionHandlerProps<TModel extends Model> = {
  tx?: PrismaClient;
  modelName: string;
  model: TModel;
  args: Record<string, unknown>;
  errorMessage: string;
};

/**
 * Helper to create a record in the database using a transaction.
 *
 * @param PrismaCreateWithTransactionHandlerProps Transaction handler properties.
 * @returns Result of the create operation.
 */
export async function prismaCreateWithTransactionHandler<
  TModel extends Model,
  TOutput,
>({
  tx,
  modelName,
  model,
  args,
  errorMessage,
}: PrismaCreateWithTransactionHandlerProps<TModel>): Promise<TOutput> {
  try {
    if (tx) {
      const result = await tx[modelName].create(args);
      return result as TOutput;
    }
    const result = await model.create(args);
    return result as TOutput;
  } catch (error) {
    throw Exception.new({
      code: Code.INTERNAL_SERVER_ERROR.code,
      message: `${errorMessage}${error.code ? `: ${error.code}` : ''}`,
      data: { error, args },
    });
  }
}
