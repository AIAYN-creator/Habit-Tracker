import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHex, textOn } from './contrast';

describe('parseHex', () => {
  it('acepta la forma corta', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
  });

  it('rechaza lo que no es un color', () => {
    expect(parseHex('rojo')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('blanco sobre negro es el maximo', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('un color consigo mismo es 1', () => {
    expect(contrastRatio('#0d7dd4', '#0d7dd4')).toBeCloseTo(1, 5);
  });

  it('detecta el caso que motiva el aviso: amarillo sobre blanco', () => {
    expect(contrastRatio('#f2cc8f', '#ffffff')).toBeLessThan(4.5);
  });
});

describe('textOn', () => {
  it('pone texto oscuro sobre un amarillo claro', () => {
    expect(textOn('#f2cc8f')).toBe('#111111');
  });

  it('pone texto claro sobre un azul oscuro', () => {
    expect(textOn('#162330')).toBe('#ffffff');
  });
});
