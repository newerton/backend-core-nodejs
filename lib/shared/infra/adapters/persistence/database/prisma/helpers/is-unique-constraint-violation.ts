export interface PrismaError extends Error {
  code: string;
}

export function isUniqueConstraintViolation(error: PrismaError): boolean {
  return error.code === 'P2002';
}
