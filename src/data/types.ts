/**
 * Modelo de datos schema-driven. Ver docs/producto/modelo.md.
 *
 * Regla que atraviesa todo el fichero: la ausencia de una clave significa "no
 * registrado", que no es lo mismo que false o 0.
 */

/** Sube cuando cambia el formato de los ficheros JSON del repo. No es la version de Dexie. */
export const SCHEMA_VERSION = 1;

/** Clave de dia en formato YYYY-MM-DD, en hora local del dispositivo. */
export type DateKey = string;

/** Marca de tiempo UTC ISO-8601. */
export type Timestamp = string;

export type HabitType = 'boolean' | 'counter' | 'duration' | 'scale';

export interface HabitConfig {
  /** counter y duration */
  unit?: string;
  step?: number;
  target?: number;
  /** scale */
  min?: number;
  max?: number;
  labels?: string[];
}

export type Frequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; times: number }
  /** ISO: lunes = 1 */
  | { kind: 'weekdays'; days: number[] }
  | { kind: 'none' };

/** Como se visualiza y se registra esta metrica. Opcional: si falta, el defecto del tipo. */
export interface Display {
  chart?: 'heatmap' | 'line' | 'bars';
  /** Solo para escalas de maximo 5: se registra tocando una de cinco caras. */
  input?: 'faces';
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  config: HabitConfig;
  frequency: Frequency;
  category?: string;
  color: string;
  order: number;
  display?: Display;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt: Timestamp | null;
}

export type MoodType = 'scale' | 'tags' | 'note';

export interface MoodConfig {
  min?: number;
  max?: number;
  labels?: string[];
  /** tags: sugerencias, nunca una restriccion */
  options?: string[];
}

export interface MoodDimension {
  id: string;
  name: string;
  type: MoodType;
  config: MoodConfig;
  color: string;
  order: number;
  display?: Display;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archivedAt: Timestamp | null;
}

export type HabitValue = boolean | number;
export type MoodValue = number | string[] | string;

export interface Entry {
  date: DateKey;
  schemaVersion: number;
  habits: Record<string, HabitValue>;
  moods: Record<string, MoodValue>;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Que mitad de la entrada se esta tocando. */
export type EntryKind = 'habits' | 'moods';

/** Un fichero pendiente de empujar al repo. Se encola la ruta, no el contenido. */
export interface OutboxItem {
  id?: number;
  path: string;
  createdAt: Timestamp;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

/** Ultima version sincronizada de un fichero: la base de la fusion a tres bandas. */
export interface SyncBaseRow {
  path: string;
  content: string;
  syncedAt: Timestamp;
}
