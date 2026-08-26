import { shiftDays, toLocalDateKey, fromLocalDateKey, mondayOf } from '@/lib/date';
import type { Bucket } from '@/ui';

/**
 * Agrupacion automatica segun el rango visible. Ver docs/graficas/barras.md.
 *
 * Un año en barras diarias son 365 barras de dos pixeles. Y se dice cual esta
 * activa: una grafica que cambia de unidad en silencio se malinterpreta.
 */
export type Grouping = 'day' | 'week' | 'month';

export function groupingFor(days: number): Grouping {
  if (days <= 31) return 'day';
  if (days <= 186) return 'week';
  return 'month';
}

export function groupingLabel(grouping: Grouping): string {
  return { day: 'por día', week: 'por semana', month: 'por mes' }[grouping];
}

/** Cuantos dias del intervalo cubre un objetivo diario. */
export function targetFactor(grouping: Grouping): number {
  return { day: 1, week: 7, month: 30 }[grouping];
}

function keyFor(date: string, grouping: Grouping): string {
  if (grouping === 'day') return date;
  if (grouping === 'week') return mondayOf(date);
  return `${date.slice(0, 7)}-01`;
}

function labelFor(key: string, grouping: Grouping): string {
  const date = fromLocalDateKey(key);
  if (grouping === 'month') {
    return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
  }
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
}

export function bucketize(
  values: Map<string, number>,
  from: string,
  to: string,
  grouping: Grouping,
): Bucket[] {
  const sums = new Map<string, number>();
  for (let date = from; date <= to; date = shiftDays(date, 1)) {
    const key = keyFor(date, grouping);
    sums.set(key, (sums.get(key) ?? 0) + (values.get(date) ?? 0));
  }

  const today = toLocalDateKey(new Date());
  const currentKey = keyFor(today, grouping);

  return [...sums.entries()].map(([key, value]) => ({
    label: labelFor(key, grouping),
    value,
    partial: key === currentKey && grouping !== 'day',
  }));
}
