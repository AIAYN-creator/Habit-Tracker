import { fromLocalDateKey } from '@/lib/date';
import type { DateKey, Entry, Habit } from './types';

/**
 * Que se esperaba de un dia y cuanto se cumplio.
 *
 * La frecuencia de `modelo` existe justo para esto: sin ella no se puede
 * distinguir un dia flojo de un dia en el que no tocaba nada.
 */

/** ISO: lunes = 1, domingo = 7. */
export function isoWeekday(date: DateKey): number {
  const day = fromLocalDateKey(date).getDay();
  return day === 0 ? 7 : day;
}

export function isExpected(habit: Habit, date: DateKey): boolean {
  if (habit.archivedAt !== null && habit.archivedAt.slice(0, 10) <= date) return false;
  if (habit.createdAt.slice(0, 10) > date) return false;

  switch (habit.frequency.kind) {
    case 'daily':
      return true;
    case 'weekdays':
      return habit.frequency.days.includes(isoWeekday(date));
    // Sin dias fijos: cuenta para la adherencia semanal, no para la del dia.
    case 'weekly':
    case 'none':
      return false;
  }
}

/** Un valor cuenta como hecho si no es ausencia, false ni cero. */
export function isDone(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (value === false || value === 0) return false;
  return true;
}

export interface DaySummary {
  expected: number;
  done: number;
  registered: boolean;
  /** 0 a 1. Sin nada esperado, la proporcion es 1 si se registro algo. */
  ratio: number;
}

export function summarize(habits: Habit[], entry: Entry | undefined, date: DateKey): DaySummary {
  const expectedHabits = habits.filter((habit) => isExpected(habit, date));
  const done = expectedHabits.filter((habit) => isDone(entry?.habits[habit.id])).length;
  const extras = Object.values(entry?.habits ?? {}).filter(isDone).length;

  return {
    expected: expectedHabits.length,
    done,
    registered: entry !== undefined,
    ratio:
      expectedHabits.length > 0
        ? done / expectedHabits.length
        : extras > 0 || entry !== undefined
          ? 1
          : 0,
  };
}
