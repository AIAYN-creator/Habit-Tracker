import { describe, expect, it } from 'vitest';
import { canApplySchemaChange, FutureSchemaError, parseEntry } from './validation';
import type { Habit } from './types';

const entry = {
  date: '2026-08-26',
  schemaVersion: 1,
  habits: { h_run: 35, h_read: true },
  moods: { m_energy: 4, m_tags: ['social'] },
  createdAt: '2026-08-26T20:00:00Z',
  updatedAt: '2026-08-26T20:00:00Z',
};

const habit: Habit = {
  id: 'h_1',
  name: 'Ánimo',
  type: 'scale',
  config: { min: 1, max: 10 },
  frequency: { kind: 'daily' },
  color: '#000000',
  order: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  archivedAt: null,
};

describe('parseEntry', () => {
  it('acepta una entrada valida', () => {
    expect(parseEntry(entry, 'x.json').habits['h_run']).toBe(35);
  });

  it('conserva las claves que no conoce', () => {
    // Si el movil escribe un campo nuevo, el iPad no debe borrarlo al
    // reescribir el fichero.
    const conFuturo = { ...entry, inventadoEnV2: { algo: true } };
    const parsed = parseEntry(conFuturo, 'x.json') as unknown as Record<string, unknown>;
    expect(parsed['inventadoEnV2']).toEqual({ algo: true });
  });

  it('rechaza una fecha con formato invalido', () => {
    expect(() => parseEntry({ ...entry, date: '26/08/2026' }, 'x.json')).toThrow(/x\.json/);
  });

  it('no intenta adivinar una version futura', () => {
    expect(() => parseEntry({ ...entry, schemaVersion: 99 }, 'x.json')).toThrow(FutureSchemaError);
  });

  it('traduce el error a algo legible', () => {
    expect(() => parseEntry({ ...entry, habits: { h_run: 'mucho' } }, 'x.json')).toThrow(
      /no tiene el tipo esperado/,
    );
  });
});

describe('canApplySchemaChange', () => {
  it('permite renombrar y recolorear', () => {
    expect(canApplySchemaChange(habit, { ...habit, name: 'Otro', color: '#fff' })).toEqual({
      ok: true,
    });
  });

  it('bloquea siempre el cambio de tipo, con alternativa', () => {
    const result = canApplySchemaChange(habit, { ...habit, type: 'counter' });
    expect(result).toMatchObject({ ok: false, suggestion: 'Archivar y crear uno nuevo' });
  });

  it('permite ampliar el rango de una escala', () => {
    expect(canApplySchemaChange(habit, { ...habit, config: { min: 1, max: 20 } })).toEqual({
      ok: true,
    });
  });

  it('permite reducirlo si no hay datos afectados', () => {
    const reducido = { ...habit, config: { min: 1, max: 5 } };
    expect(canApplySchemaChange(habit, reducido, [1, 3, 5])).toEqual({ ok: true });
  });

  it('lo bloquea si los hay, y dice cuantos', () => {
    const reducido = { ...habit, config: { min: 1, max: 5 } };
    expect(canApplySchemaChange(habit, reducido, [1, 7, 9])).toMatchObject({
      ok: false,
      affected: 2,
    });
  });
});
