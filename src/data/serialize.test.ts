import { describe, expect, it } from 'vitest';
import { fromBase64, parseJson, stableStringify, toBase64 } from './serialize';

describe('stableStringify', () => {
  it('ordena las claves alfabeticamente, tambien anidadas', () => {
    const salida = stableStringify({ b: 1, a: { d: 2, c: 3 } });
    expect(salida).toBe('{\n  "a": {\n    "c": 3,\n    "d": 2\n  },\n  "b": 1\n}\n');
  });

  it('produce bytes identicos para el mismo objeto en distinto orden', () => {
    expect(stableStringify({ x: 1, y: 2 })).toBe(stableStringify({ y: 2, x: 1 }));
  });

  it('no reordena los arrays, que tienen orden propio', () => {
    expect(stableStringify(['c', 'a', 'b'])).toContain('"c",\n  "a",\n  "b"');
  });

  it('termina en salto de linea', () => {
    expect(stableStringify({ a: 1 }).endsWith('\n')).toBe(true);
  });
});

describe('base64', () => {
  it('sobrevive a tildes y emoji', () => {
    // El primer habito llamado "Meditación" romperia un btoa a secas.
    const texto = 'Meditación 🧘 y natación';
    expect(fromBase64(toBase64(texto))).toBe(texto);
  });

  it('ida y vuelta de un fichero de dia completo', () => {
    const json = stableStringify({ date: '2026-08-26', note: 'Día raro pero bien.' });
    expect(fromBase64(toBase64(json))).toBe(json);
  });

  it('no desborda con contenido grande', () => {
    const grande = 'á'.repeat(50_000);
    expect(fromBase64(toBase64(grande))).toBe(grande);
  });
});

describe('parseJson', () => {
  it('conserva las claves que no conoce', () => {
    const parsed = parseJson('{"date":"2026-08-26","futuro":42}', 'entries/x.json');
    expect(parsed['futuro']).toBe(42);
  });

  it('dice que fichero fallo', () => {
    expect(() => parseJson('{roto', 'entries/2026/2026-08-26.json')).toThrow(
      /entries\/2026\/2026-08-26\.json/,
    );
  });

  it('rechaza un array donde se espera un objeto', () => {
    expect(() => parseJson('[1,2]', 'x.json')).toThrow();
  });
});
