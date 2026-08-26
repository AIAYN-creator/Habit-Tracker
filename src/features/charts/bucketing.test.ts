import { describe, expect, it } from 'vitest';
import { bucketize, groupingFor, groupingLabel, targetFactor } from './bucketing';

describe('groupingFor', () => {
  it('cambia de unidad segun el rango', () => {
    expect(groupingFor(30)).toBe('day');
    expect(groupingFor(90)).toBe('week');
    expect(groupingFor(365)).toBe('month');
  });
});

describe('bucketize', () => {
  it('suma dentro del intervalo', () => {
    const valores = new Map([
      ['2026-08-24', 10],
      ['2026-08-25', 20],
      ['2026-08-26', 5],
    ]);
    const semanas = bucketize(valores, '2026-08-24', '2026-08-30', 'week');
    expect(semanas).toHaveLength(1);
    expect(semanas[0]?.value).toBe(35);
  });

  it('deja a cero los intervalos sin datos, sin saltarselos', () => {
    const dias = bucketize(new Map([['2026-08-26', 3]]), '2026-08-24', '2026-08-26', 'day');
    expect(dias.map((bucket) => bucket.value)).toEqual([0, 0, 3]);
  });

  it('agrupa por mes cuando toca', () => {
    const valores = new Map([
      ['2026-07-31', 1],
      ['2026-08-01', 2],
    ]);
    const meses = bucketize(valores, '2026-07-01', '2026-08-31', 'month');
    expect(meses).toHaveLength(2);
    expect(meses.map((bucket) => bucket.value)).toEqual([1, 2]);
  });
});

describe('targetFactor y groupingLabel', () => {
  it('escala el objetivo diario al intervalo', () => {
    expect(targetFactor('day')).toBe(1);
    expect(targetFactor('week')).toBe(7);
  });

  it('dice en la grafica que agrupacion esta activa', () => {
    expect(groupingLabel('week')).toBe('por semana');
  });
});
