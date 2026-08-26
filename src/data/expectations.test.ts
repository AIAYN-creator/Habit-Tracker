import { describe, expect, it } from 'vitest';
import { isDone, isExpected, isoWeekday, summarize } from './expectations';
import type { Habit } from './types';

const base: Habit = {
  id: 'h_1',
  name: 'Correr',
  type: 'boolean',
  config: {},
  frequency: { kind: 'daily' },
  color: '#000000',
  order: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  archivedAt: null,
};

describe('isoWeekday', () => {
  it('el domingo es 7, no 0', () => {
    expect(isoWeekday('2026-08-30')).toBe(7);
    expect(isoWeekday('2026-08-24')).toBe(1);
  });
});

describe('isExpected', () => {
  it('no espera nada antes de crear el habito', () => {
    expect(isExpected({ ...base, createdAt: '2026-08-26T10:00:00Z' }, '2026-08-25')).toBe(false);
  });

  it('deja de esperar despues de archivarlo', () => {
    const archivado = { ...base, archivedAt: '2026-08-20T10:00:00Z' };
    expect(isExpected(archivado, '2026-08-26')).toBe(false);
    expect(isExpected(archivado, '2026-08-19')).toBe(true);
  });

  it('respeta los dias concretos', () => {
    const laborable: Habit = { ...base, frequency: { kind: 'weekdays', days: [1, 2, 3, 4, 5] } };
    expect(isExpected(laborable, '2026-08-26')).toBe(true);
    expect(isExpected(laborable, '2026-08-30')).toBe(false);
  });

  it('sin expectativa no espera ningun dia concreto', () => {
    expect(isExpected({ ...base, frequency: { kind: 'none' } }, '2026-08-26')).toBe(false);
  });
});

describe('isDone', () => {
  it('distingue no registrado de registrado a cero', () => {
    expect(isDone(undefined)).toBe(false);
    expect(isDone(false)).toBe(false);
    expect(isDone(0)).toBe(false);
    expect(isDone(true)).toBe(true);
    expect(isDone(35)).toBe(true);
  });
});

describe('summarize', () => {
  const entry = {
    date: '2026-08-26',
    schemaVersion: 1,
    habits: { h_1: true, h_2: false },
    moods: {},
    createdAt: '',
    updatedAt: '',
  };

  it('cuenta solo lo esperado ese dia', () => {
    const otro: Habit = { ...base, id: 'h_2', frequency: { kind: 'none' } };
    const resumen = summarize([base, otro], entry, '2026-08-26');
    expect(resumen).toMatchObject({ expected: 1, done: 1, ratio: 1, registered: true });
  });

  it('un dia sin registrar no es un dia a cero', () => {
    const resumen = summarize([base], undefined, '2026-08-26');
    expect(resumen.registered).toBe(false);
    expect(resumen.ratio).toBe(0);
  });

  it('registrado sin cumplir nada da proporcion cero pero registrado', () => {
    const vacio = { ...entry, habits: { h_1: false } };
    const resumen = summarize([base], vacio, '2026-08-26');
    expect(resumen).toMatchObject({ done: 0, ratio: 0, registered: true });
  });
});
