import { z } from 'zod';
import type { Entry, Habit, MoodDimension } from './types';
import { SCHEMA_VERSION } from './types';

/**
 * Validacion en las fronteras. Ver docs/tecnica/validacion.md.
 *
 * Solo se valida lo que entra de fuera —lectura del repo e importacion—, no
 * cada lectura de IndexedDB: lo que ya esta en local paso por una de esas
 * puertas, y con useLiveQuery esas consultas son constantes.
 */

/**
 * `loose` y no `strict`: si el movil escribe un campo que este dispositivo
 * todavia no conoce, **no se descarta**. Con la configuracion por defecto de
 * zod, el dispositivo mas viejo borraria en silencio el trabajo del mas nuevo
 * en cada sincronizacion.
 */
const habitValue = z.union([z.boolean(), z.number()]);
const moodValue = z.union([z.number(), z.string(), z.array(z.string())]);

export const entrySchema = z.looseObject({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  schemaVersion: z.number().int().positive(),
  habits: z.record(z.string(), habitValue),
  moods: z.record(z.string(), moodValue),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const frequency = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('daily') }),
  z.object({ kind: z.literal('weekly'), times: z.number().int().positive() }),
  z.object({ kind: z.literal('weekdays'), days: z.array(z.number().int().min(1).max(7)) }),
  z.object({ kind: z.literal('none') }),
]);

export const habitSchema = z.looseObject({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['boolean', 'counter', 'duration', 'scale']),
  config: z.looseObject({
    unit: z.string().optional(),
    step: z.number().optional(),
    target: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    labels: z.array(z.string()).optional(),
  }),
  frequency,
  category: z.string().optional(),
  color: z.string(),
  order: z.number(),
  display: z.looseObject({}).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});

/** Un fichero con una version mayor que la que entiende la app no se toca. */
export class FutureSchemaError extends Error {
  constructor(readonly version: number) {
    super(`El fichero viene de una versión más nueva de la app (${String(version)})`);
    this.name = 'FutureSchemaError';
  }
}

export function parseEntry(raw: unknown, path: string): Entry {
  const version = (raw as { schemaVersion?: unknown } | null)?.schemaVersion;
  if (typeof version === 'number' && version > SCHEMA_VERSION) throw new FutureSchemaError(version);

  const result = entrySchema.safeParse(raw);
  if (!result.success) throw new Error(`${path}: ${describe(result.error)}`);
  return result.data;
}

export function parseHabits(raw: unknown, path: string): Habit[] {
  const result = z.array(habitSchema).safeParse(raw);
  if (!result.success) throw new Error(`${path}: ${describe(result.error)}`);
  return result.data;
}

/** Los mensajes de zod no son para una persona: se traducen antes de mostrarse. */
export function describe(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'El fichero no tiene el formato esperado';
  const where = issue.path.join('.');
  // invalid_union es lo que devuelve un valor de habito o de animo con el tipo
  // cambiado, que es el caso real que se quiere explicar bien.
  if (issue.code === 'invalid_type' || issue.code === 'invalid_union') {
    return `El campo ${where} no tiene el tipo esperado`;
  }
  return `Hay un problema en ${where || 'el fichero'}`;
}

export type SchemaChange =
  { ok: true } | { ok: false; reason: string; suggestion: string; affected?: number };

/**
 * Si un cambio de schema se puede aplicar sin romper el historico.
 * Es la tabla de `modelo`, traducida a algo que la UI consulta antes de guardar.
 */
export function canApplySchemaChange(
  before: Habit | MoodDimension,
  after: Habit | MoodDimension,
  values: number[] = [],
): SchemaChange {
  if (before.type !== after.type) {
    return {
      ok: false,
      reason: 'El tipo no se puede cambiar: las entradas ya registradas dejarían de tener sentido.',
      suggestion: 'Archivar y crear uno nuevo',
    };
  }

  const oldMax = before.config.max;
  const newMax = after.config.max;
  if (typeof oldMax === 'number' && typeof newMax === 'number' && newMax < oldMax) {
    // Depende de los datos, no solo del schema: si nunca puntuaste por encima
    // de 5, pasar de 1-10 a 1-5 es inofensivo.
    const affected = values.filter((value) => value > newMax).length;
    if (affected > 0) {
      return {
        ok: false,
        reason: `Hay ${String(affected)} entradas con valores por encima de ${String(newMax)}.`,
        suggestion: 'Mantener el rango o archivar y crear uno nuevo',
        affected,
      };
    }
  }

  return { ok: true };
}
