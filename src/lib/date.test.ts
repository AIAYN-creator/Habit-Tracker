import { describe, expect, it } from 'vitest';
import { daysBetween, fromLocalDateKey, mondayOf, shiftDays, toLocalDateKey, yearOf } from './date';

describe('toLocalDateKey', () => {
  it('usa la hora local y no UTC', () => {
    // 00:30 local: toISOString() daria el dia anterior en husos al este de UTC.
    const madrugada = new Date(2026, 7, 26, 0, 30);
    expect(toLocalDateKey(madrugada)).toBe('2026-08-26');
  });

  it('rellena mes y dia con cero', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('shiftDays', () => {
  it('retrocede al dia anterior', () => {
    expect(shiftDays('2026-08-26', -1)).toBe('2026-08-25');
  });

  it('cruza el limite de mes', () => {
    expect(shiftDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('cruza el limite de anio', () => {
    expect(shiftDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('resuelve el 29 de febrero de un bisiesto', () => {
    expect(shiftDays('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('fromLocalDateKey', () => {
  it('rechaza una clave invalida', () => {
    expect(() => fromLocalDateKey('no-es-fecha')).toThrow();
  });

  it('es inverso de toLocalDateKey', () => {
    expect(toLocalDateKey(fromLocalDateKey('2026-03-29'))).toBe('2026-03-29');
  });
});

describe('yearOf', () => {
  it('devuelve la carpeta del repo de datos', () => {
    expect(yearOf('2026-08-26')).toBe('2026');
  });
});

describe('mondayOf', () => {
  it('devuelve el mismo dia si ya es lunes', () => {
    expect(mondayOf('2026-08-24')).toBe('2026-08-24');
  });

  it('retrocede al lunes desde un miercoles', () => {
    expect(mondayOf('2026-08-26')).toBe('2026-08-24');
  });

  it('trata el domingo como final de semana, no como principio', () => {
    expect(mondayOf('2026-08-30')).toBe('2026-08-24');
  });
});

describe('daysBetween', () => {
  it('cuenta los dias de diferencia', () => {
    expect(daysBetween('2026-08-24', '2026-08-26')).toBe(2);
  });

  it('cruza el cambio de horario sin descuadrarse', () => {
    // El ultimo domingo de octubre atrasa una hora en Europa.
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });
});
