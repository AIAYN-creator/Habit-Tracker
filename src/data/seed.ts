import { shiftDays, todayLocal } from '@/lib/date';
import { db } from './db';
import { habitId, moodId } from './ids';
import { SCHEMA_VERSION, type Entry, type Habit, type MoodDimension } from './types';

/**
 * Fixtures de desarrollo. Ver docs/tecnica/seed.md.
 *
 * **Ningun dato real entra aqui.** Es un repositorio publico, y este es el
 * sitio donde mas facil seria saltarselo por comodidad.
 *
 * Deterministas: una captura que cambia en cada recarga no sirve para comparar
 * dos diseños, y un test que depende de datos aleatorios falla un martes sin
 * razon aparente.
 */

/** PRNG diminuto y estable. Misma semilla, mismos datos. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Recipe {
  name: string;
  type: Habit['type'];
  config: Habit['config'];
  frequency: Habit['frequency'];
  color: string;
  /** Cuantas veces se cumple, de 0 a 1. */
  adherence: number;
  /** Se abandona a partir de este dia del periodo. */
  abandonAfter?: number;
  weekendBoost?: number;
}

const RECIPES: Recipe[] = [
  {
    name: 'Leer',
    type: 'boolean',
    config: {},
    frequency: { kind: 'daily' },
    color: '#e07a5f',
    adherence: 0.9,
  },
  {
    name: 'Correr',
    type: 'duration',
    config: { unit: 'min', step: 5, target: 30 },
    frequency: { kind: 'weekdays', days: [2, 4, 6] },
    color: '#3d5a80',
    adherence: 0.55,
    weekendBoost: 0.25,
  },
  {
    name: 'Agua',
    type: 'counter',
    config: { unit: 'vasos', step: 1, target: 8 },
    frequency: { kind: 'daily' },
    color: '#81b29a',
    adherence: 0.75,
  },
  {
    name: 'Meditar',
    type: 'boolean',
    config: {},
    frequency: { kind: 'daily' },
    color: '#9d8189',
    adherence: 0.4,
    // Se abandona a los dos meses: el heatmap tiene que aguantar eso.
    abandonAfter: 60,
  },
];

const DAYS = 18 * 30;

export interface Fixture {
  habits: Habit[];
  moods: MoodDimension[];
  entries: Entry[];
}

export function buildFixture(seed = 42): Fixture {
  const random = mulberry32(seed);
  const now = new Date().toISOString();
  const start = shiftDays(todayLocal(), -(DAYS - 1));

  const habits: Habit[] = RECIPES.map((recipe, index) => ({
    id: habitId(),
    name: recipe.name,
    type: recipe.type,
    config: recipe.config,
    frequency: recipe.frequency,
    color: recipe.color,
    order: index + 1,
    createdAt: `${start}T08:00:00.000Z`,
    updatedAt: now,
    archivedAt: null,
  }));

  const mood: MoodDimension = {
    id: moodId(),
    name: 'Ánimo',
    type: 'scale',
    config: { min: 1, max: 5 },
    display: { input: 'faces' },
    color: '#3d5a80',
    order: 1,
    createdAt: `${start}T08:00:00.000Z`,
    updatedAt: now,
    archivedAt: null,
  };

  const entries: Entry[] = [];
  // Rachas y recaidas, no una moneda al aire: es lo que se ve en la realidad.
  const streak = habits.map(() => 0);

  for (let day = 0; day < DAYS; day += 1) {
    const date = shiftDays(start, day);
    const weekday = new Date(`${date}T12:00:00`).getDay();
    const weekend = weekday === 0 || weekday === 6;

    // Huecos: dias sin registrar, que no son dias a cero.
    if (random() < 0.08) continue;

    const values: Record<string, number | boolean> = {};
    habits.forEach((habit, index) => {
      const recipe = RECIPES[index];
      if (!recipe) return;
      if (recipe.abandonAfter !== undefined && day > recipe.abandonAfter) return;

      const bonus = weekend ? (recipe.weekendBoost ?? -0.1) : 0;
      const momentum = Math.min(streak[index] ?? 0, 5) * 0.03;
      const done = random() < recipe.adherence + bonus + momentum;
      streak[index] = done ? (streak[index] ?? 0) + 1 : 0;
      if (!done) return;

      if (habit.type === 'boolean') values[habit.id] = true;
      else if (habit.type === 'duration') values[habit.id] = 20 + Math.floor(random() * 5) * 5;
      else values[habit.id] = 4 + Math.floor(random() * 6);
    });

    // Estacionalidad suave, para que la linea tenga forma y no sea ruido.
    const wave = Math.sin((day / DAYS) * Math.PI * 3) * 0.8;
    const level = Math.max(1, Math.min(5, Math.round(3 + wave + (random() - 0.5) * 1.6)));

    entries.push({
      date,
      schemaVersion: SCHEMA_VERSION,
      habits: values,
      moods: { [mood.id]: level },
      note: random() < 0.06 ? 'Día raro pero bien.' : undefined,
      createdAt: `${date}T21:00:00.000Z`,
      updatedAt: `${date}T21:00:00.000Z`,
    });
  }

  return { habits, moods: [mood], entries };
}

/**
 * Vacia la base y carga los fixtures. **Nunca se mezcla con datos reales**:
 * una base mitad real mitad sintetica es imposible de razonar.
 */
export async function loadFixture(seed = 42): Promise<void> {
  const fixture = buildFixture(seed);
  await db.transaction(
    'rw',
    [db.habits, db.moodDimensions, db.entries, db.outbox, db.syncBase, db.syncState],
    async () => {
      await Promise.all([
        db.habits.clear(),
        db.moodDimensions.clear(),
        db.entries.clear(),
        db.outbox.clear(),
        db.syncBase.clear(),
      ]);
      await db.habits.bulkAdd(fixture.habits);
      await db.moodDimensions.bulkAdd(fixture.moods);
      await db.entries.bulkAdd(fixture.entries);
    },
  );
}
