import { Prisma } from '@prisma/client';

export const deepMapToOutput = <T extends object>(data: T): T => {
  const convert = (value: any): any => {   
    if (value instanceof Prisma.Decimal) return Number(value);
    if (Array.isArray(value)) return value.map(convert);
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((acc, [k, v]) => ({
        ...acc,
        [k]: convert(v)
      }), {});
    }
    return value;
  };

  return convert(data) as T;
};