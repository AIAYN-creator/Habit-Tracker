import { describe, expect, it } from 'vitest';
import { mergeRecords } from './merge';

describe('mergeRecords', () => {
  it('conserva los dos cambios cuando cada lado toco una clave distinta', () => {
    // El caso cotidiano: marcar correr en el movil y leer en el iPad.
    const { merged, conflicts } = mergeRecords({}, { h_run: 35 }, { h_read: true }, true);
    expect(merged).toEqual({ h_run: 35, h_read: true });
    expect(conflicts).toHaveLength(0);
  });

  it('no toca lo que no cambio en ninguno de los dos lados', () => {
    const base = { h_run: 30 };
    const { merged } = mergeRecords(base, { h_run: 30 }, { h_run: 30 }, true);
    expect(merged).toEqual({ h_run: 30 });
  });

  it('deja pasar el cambio del unico lado que lo hizo', () => {
    const base = { h_run: 30 };
    expect(mergeRecords(base, { h_run: 40 }, { h_run: 30 }, true).merged).toEqual({ h_run: 40 });
    expect(mergeRecords(base, { h_run: 30 }, { h_run: 45 }, false).merged).toEqual({ h_run: 45 });
  });

  it('no marca conflicto si ambos cambiaron al mismo valor', () => {
    const { conflicts } = mergeRecords({ h_run: 10 }, { h_run: 20 }, { h_run: 20 }, true);
    expect(conflicts).toHaveLength(0);
  });

  it('resuelve la colision real por timestamp y deja traza del descarte', () => {
    const { merged, conflicts } = mergeRecords({ h_run: 10 }, { h_run: 35 }, { h_run: 40 }, true);
    expect(merged['h_run']).toBe(40);
    expect(conflicts).toEqual([{ key: 'h_run', kept: 40, discarded: 35, keptFrom: 'remote' }]);
  });

  it('respeta un borrado hecho en un solo lado', () => {
    // Desmarcar un habito borra la clave: no debe resucitar al fusionar.
    const base: Record<string, unknown> = { h_read: true };
    expect(mergeRecords(base, {}, { h_read: true }, true).merged).toEqual({});
    expect(mergeRecords(base, { h_read: true }, {}, true).merged).toEqual({});
  });

  it('conserva lo anadido por el otro lado aunque aqui se borrara otra cosa', () => {
    const base: Record<string, unknown> = { h_read: true };
    const { merged } = mergeRecords(base, {}, { h_read: true, h_run: 20 }, true);
    expect(merged).toEqual({ h_run: 20 });
  });

  it('sin base, dos altas distintas conviven', () => {
    const { merged } = mergeRecords(undefined, { a: 1 }, { b: 2 }, true);
    expect(merged).toEqual({ a: 1, b: 2 });
  });

  it('compara por valor y no por referencia en las etiquetas', () => {
    const base = { m_tags: ['social'] };
    const { merged, conflicts } = mergeRecords(
      base,
      { m_tags: ['social'] },
      { m_tags: ['social'] },
      true,
    );
    expect(merged['m_tags']).toEqual(['social']);
    expect(conflicts).toHaveLength(0);
  });
});
