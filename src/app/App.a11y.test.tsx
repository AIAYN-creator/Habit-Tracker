import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { db } from '@/data';
import { App } from './App';

/**
 * Auditoria automatica. Ver docs/diseno/a11y.md.
 *
 * axe detecta alrededor de un tercio de los problemas reales, y ese tercio es
 * justo el aburrido de encontrar a mano: etiquetas que faltan, contraste,
 * estructura. El resto —teclado y lector de pantalla— se comprueba a mano.
 */
async function audit(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: ['wcag2a', 'wcag2aa'],
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

afterEach(async () => {
  cleanup();
  await Promise.all([db.habits.clear(), db.moodDimensions.clear(), db.entries.clear()]);
});

describe('accesibilidad', () => {
  it('la pantalla de registro no tiene violaciones', async () => {
    const { container } = render(<App />);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(await audit(container)).toEqual([]);
  });

  it('la pantalla tiene un unico h1 y regiones con nombre', async () => {
    const { container } = render(<App />);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Secciones');
  });

  it('todo control sin texto lleva nombre accesible', async () => {
    const { container } = render(<App />);
    await new Promise((resolve) => setTimeout(resolve, 150));
    const sinNombre = Array.from(container.querySelectorAll('button')).filter(
      (button) =>
        button.textContent.trim().length === 0 &&
        !button.getAttribute('aria-label') &&
        !button.getAttribute('aria-labelledby'),
    );
    expect(sinNombre).toHaveLength(0);
  });
});
