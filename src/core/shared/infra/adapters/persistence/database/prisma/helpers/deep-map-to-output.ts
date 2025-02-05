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

const convert = <V>(value: V): any => {
  if (isDecimal(value)) {
    return Number(value.toString());
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(convert);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce(
      (acc, [key, val]) => ({
        ...acc,
        [key]: convert(val),
      }),
      {} as { [key: string]: unknown },
    );
  }

  return value;
};

export const deepMapToOutput = <T extends object>(data: T): any => {
  return convert(data);
};
