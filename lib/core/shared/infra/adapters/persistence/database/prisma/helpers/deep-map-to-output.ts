import { Prisma } from '@prisma/client';

type DecimalReplacer<T> = typeof Prisma extends { Decimal: unknown }
  ? number
  : T extends Array<infer U>
    ? Array<DecimalReplacer<U>>
    : T extends object
      ? { [K in keyof T]: DecimalReplacer<T[K]> }
      : T;

export const deepMapToOutput = <T extends object>(
  data: T,
): DecimalReplacer<T> => {
  const convert = <V>(value: V): DecimalReplacer<V> => {
    if (value?.constructor?.name === 'Decimal') {
      return Number(value) as DecimalReplacer<V>;
    }

    if (Array.isArray(value)) {
      return value.map(convert) as DecimalReplacer<V>;
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce(
        (acc, [key, val]) => ({
          ...acc,
          [key]: convert(val),
        }),
        {} as { [key: string]: unknown },
      ) as DecimalReplacer<V>;
    }

    return value as DecimalReplacer<V>;
  };

  return convert(data);
};
