const isDecimal = (value: unknown): boolean => {
  return (
    typeof value === 'object' &&
    value !== null &&
    's' in value &&
    'e' in value &&
    'd' in value &&
    Array.isArray((value as any).d) &&
    typeof (value as any).s === 'number' &&
    typeof (value as any).e === 'number'
  );
};

const convert = <V, TOutput>(value: V): TOutput => {
  if (isDecimal(value)) {
    return Number(value.toString()) as unknown as TOutput;
  }

  if (value instanceof Date) {
    return value as unknown as TOutput;
  }

  if (Array.isArray(value)) {
    return value.map(convert) as unknown as TOutput;
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [key]: convert(val),
      }),
      {} as { [key: string]: unknown },
    ) as unknown as TOutput;
  }

  return value as unknown as TOutput;
};

export const deepMapToOutput = <TOutput>(data: unknown): TOutput => {
  return convert<unknown, TOutput>(data);
};
