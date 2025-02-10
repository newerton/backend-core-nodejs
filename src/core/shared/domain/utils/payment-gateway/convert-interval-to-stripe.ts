import { Interval } from '../../adapters/payment-gateway-adapter';

export type IntervalUpperCase = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export function convertIntervalToStripe(interval: IntervalUpperCase): Interval {
  switch (interval) {
    case 'DAILY':
      return 'day';
    case 'WEEKLY':
      return 'week';
    case 'MONTHLY':
      return 'month';
    case 'YEARLY':
      return 'year';
    default:
      throw new Error(`Intervalo não suportado: ${interval as Interval}`);
  }
}
