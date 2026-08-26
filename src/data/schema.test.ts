import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import * as schema from './schema';
import type { Habit } from './types';

const draft: Omit<Habit, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'archivedAt'> = {
  name: 'Correr',
  type: 'duration',
  config: { unit: 'min', step: 5, target: 30 },
  frequency: { kind: 'weekly', times: 3 },
  color: '#e07a5f',
};

beforeEach(async () => {
  await Promise.all([db.habits.clear(), db.moodDimensions.clear(), db.outbox.clear()]);
});

describe('createHabit', () => {
  it('genera un id con prefijo y lo deja activo', async () => {
    const habit = await schema.createHabit(draft);
    expect(habit.id).toMatch(/^h_[0-9a-z]{8}$/);
    expect(habit.archivedAt).toBeNull();
  });

  it('encola el schema para sincronizar', async () => {
    await schema.createHabit(draft);
    const queued = await db.outbox.toArray();
    expect(queued[0]?.path).toBe('schemas/habits.json');
  });

  it('asigna orden incremental', async () => {
    const first = await schema.createHabit(draft);
    const second = await schema.createHabit({ ...draft, name: 'Leer' });
    expect(second.order).toBeGreaterThan(first.order);
  });
});

describe('archiveHabit', () => {
  it('lo saca de los activos pero lo mantiene en el historico', async () => {
    const habit = await schema.createHabit(draft);
    await schema.archiveHabit(habit.id);

    expect(await schema.listActiveHabits()).toHaveLength(0);
    expect(await schema.listHabits()).toHaveLength(1);
  });
});

describe('createMood', () => {
  it('usa su propio prefijo de id', async () => {
    const dimension = await schema.createMood({
      name: 'Energia',
      type: 'scale',
      config: { min: 1, max: 5, labels: ['Agotado', 'Pletorico'] },
      color: '#3d5a80',
    });
    expect(dimension.id).toMatch(/^m_[0-9a-z]{8}$/);
  });
});
