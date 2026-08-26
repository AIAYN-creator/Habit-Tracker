/**
 * El dia es local, no UTC. Ver docs/modelo.md.
 * toISOString() devuelve UTC y desplaza el dia de madrugada: no usarlo aqui.
 */

/** Fecha en formato YYYY-MM-DD segun la hora local del dispositivo. */
export function toLocalDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Clave del dia de hoy. */
export function todayLocal(): string {
  return toLocalDateKey(new Date());
}

/** Convierte una clave YYYY-MM-DD en un Date a medianoche local. */
export function fromLocalDateKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new Error(`Clave de fecha invalida: ${key}`);
  const [, year, month, day] = match as unknown as [string, string, string, string];
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (toLocalDateKey(date) !== key) throw new Error(`Fecha inexistente: ${key}`);
  return date;
}

/** Desplaza una clave de dia en N dias, respetando cambios de horario. */
export function shiftDays(key: string, days: number): string {
  const date = fromLocalDateKey(key);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

/** El anio de una clave, que es la carpeta del repo de datos. */
export function yearOf(key: string): string {
  return key.slice(0, 4);
}

export function formatLongDate(key: string, locale = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fromLocalDateKey(key));
}

/** El lunes de la semana de esa fecha. La semana empieza en lunes, como se espera aqui. */
export function mondayOf(key: string): string {
  const date = fromLocalDateKey(key);
  const weekday = (date.getDay() + 6) % 7; // domingo = 6
  date.setDate(date.getDate() - weekday);
  return toLocalDateKey(date);
}

/** Dias entre dos claves, sin contar horas. */
export function daysBetween(from: string, to: string): number {
  const ms = fromLocalDateKey(to).getTime() - fromLocalDateKey(from).getTime();
  return Math.round(ms / 86_400_000);
}
