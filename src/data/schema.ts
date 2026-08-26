import { db } from './db';
import { habitId, moodId } from './ids';
import type { Habit, MoodDimension } from './types';

/** CRUD de las definiciones. Archivar, nunca borrar cuando hay datos detras. */

function nowIso(): string {
  return new Date().toISOString();
}

const SCHEMA_PATH = { habits: 'schemas/habits.json', moods: 'schemas/moods.json' } as const;

type Draft<T> = Omit<T, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'archivedAt'>;

async function enqueue(path: string, now: string): Promise<void> {
  await db.outbox.add({ path, createdAt: now });
}

export function listHabits(): Promise<Habit[]> {
  return db.habits.orderBy('order').toArray();
}

/**
 * Sin `async`: devuelve la promesa de Dexie tal cual.
 *
 * Envolverla en una funcion async nativa rompe el rastreo de zonas de Dexie y
 * `useLiveQuery` deja de reaccionar a las escrituras: la primera carga funciona
 * y a partir de ahi la UI se queda congelada hasta recargar.
 */
export function listActiveHabits(): Promise<Habit[]> {
  return db.habits.filter((habit) => habit.archivedAt === null).sortBy('order');
}

export async function createHabit(draft: Draft<Habit>): Promise<Habit> {
  const now = nowIso();
  const habit: Habit = {
    ...draft,
    id: habitId(),
    order: (await db.habits.count()) + 1,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  await db.transaction('rw', db.habits, db.outbox, async () => {
    await db.habits.add(habit);
    await enqueue(SCHEMA_PATH.habits, now);
  });
  return habit;
}

export async function updateHabit(id: string, patch: Partial<Draft<Habit>>): Promise<void> {
  const now = nowIso();
  await db.transaction('rw', db.habits, db.outbox, async () => {
    await db.habits.update(id, { ...patch, updatedAt: now });
    await enqueue(SCHEMA_PATH.habits, now);
  });
}

/** El tipo no se puede cambiar: se archiva y se crea uno nuevo. */
export async function archiveHabit(id: string): Promise<void> {
  const now = nowIso();
  await db.transaction('rw', db.habits, db.outbox, async () => {
    await db.habits.update(id, { archivedAt: now, updatedAt: now });
    await enqueue(SCHEMA_PATH.habits, now);
  });
}

export function listMoods(): Promise<MoodDimension[]> {
  return db.moodDimensions.orderBy('order').toArray();
}

/** Sin `async`, por lo mismo que `listActiveHabits`. */
export function listActiveMoods(): Promise<MoodDimension[]> {
  return db.moodDimensions.filter((dimension) => dimension.archivedAt === null).sortBy('order');
}

export async function createMood(draft: Draft<MoodDimension>): Promise<MoodDimension> {
  const now = nowIso();
  const dimension: MoodDimension = {
    ...draft,
    id: moodId(),
    order: (await db.moodDimensions.count()) + 1,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
  await db.transaction('rw', db.moodDimensions, db.outbox, async () => {
    await db.moodDimensions.add(dimension);
    await enqueue(SCHEMA_PATH.moods, now);
  });
  return dimension;
}

export async function archiveMood(id: string): Promise<void> {
  const now = nowIso();
  await db.transaction('rw', db.moodDimensions, db.outbox, async () => {
    await db.moodDimensions.update(id, { archivedAt: now, updatedAt: now });
    await enqueue(SCHEMA_PATH.moods, now);
  });
}
