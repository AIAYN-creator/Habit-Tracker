import { describe, expect, it } from 'vitest';
import { buildFixture } from './seed';
import { isDone } from './expectations';

describe('buildFixture', () => {
  it('la misma semilla produce exactamente los mismos datos', () => {
    const a = buildFixture(7);
    const b = buildFixture(7);
    expect(a.entries.map((entry) => entry.date)).toEqual(b.entries.map((entry) => entry.date));
    expect(a.entries.map((entry) => Object.keys(entry.habits).length)).toEqual(
      b.entries.map((entry) => Object.keys(entry.habits).length),
    );
  });

  it('semillas distintas producen datos distintos', () => {
    const a = buildFixture(1);
    const b = buildFixture(2);
    expect(a.entries.length).not.toBe(b.entries.length);
  });

  it('deja huecos: no registra todos los dias', () => {
    const { entries } = buildFixture();
    // 18 meses de datos, con dias sin registrar entre medias.
    expect(entries.length).toBeGreaterThan(400);
    expect(entries.length).toBeLessThan(540);
  });

  it('cubre los tipos de habito que alimentan cada grafica', () => {
    const { habits } = buildFixture();
    expect(new Set(habits.map((habit) => habit.type))).toEqual(
      new Set(['boolean', 'duration', 'counter']),
    );
  });

  it('incluye un habito abandonado a mitad del historico', () => {
    const { habits, entries } = buildFixture();
    const meditar = habits.find((habit) => habit.name === 'Meditar');
    const conMeditar = entries.filter((entry) => isDone(entry.habits[meditar?.id ?? '']));
    const ultima = conMeditar.at(-1)?.date ?? '';
    const ultimaDelTodo = entries.at(-1)?.date ?? '';
    expect(ultima < ultimaDelTodo).toBe(true);
  });

  it('el animo usa caras y se queda dentro de su escala', () => {
    const { moods, entries } = buildFixture();
    const animo = moods[0];
    expect(animo?.display?.input).toBe('faces');
    const valores = entries.map((entry) => entry.moods[animo?.id ?? '']);
    expect(valores.every((value) => typeof value === 'number' && value >= 1 && value <= 5)).toBe(
      true,
    );
  });

  it('no contiene ningun dato real: los nombres salen del catalogo', () => {
    const { habits } = buildFixture();
    expect(habits.map((habit) => habit.name)).toEqual(['Leer', 'Correr', 'Agua', 'Meditar']);
  });
});
