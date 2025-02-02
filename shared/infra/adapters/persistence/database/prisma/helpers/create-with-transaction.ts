import { PrismaClient } from '@prisma/client';

import { Code } from '../../../../../../domain/errors/code';
import { Exception } from '../../../../../../domain/exceptions/exception';

type PrismaCreateWithTransactionHandlerProps = {
  tx?: PrismaClient;
  model: PrismaClient;
  args: Record<string, unknown>;
  errorMessage: string;
};

/**
 * Helper para lidar com transações no Prisma usando TypeScript.
 *
 * @param PrismaCreateWithTransactionHandlerProps Parâmetros da transação
 * @returns O resultado da operação Prisma.
 */
export async function prismaCreateWithTransactionHandler<T>({
  tx,
  model,
  args,
  errorMessage,
}: PrismaCreateWithTransactionHandlerProps): Promise<T> {
  try {
    if (tx) {
      const result = await tx[model].create(args);
      return result as T;
    }
    const result = await model.create(args);
    return result as T;
  } catch (error) {
    throw Exception.new({
      code: Code.INTERNAL_SERVER_ERROR.code,
      message: errorMessage,
      data: { error, args },
    });
    throw new Error('Erro ao criar registro no banco de dados.');
  }
}
