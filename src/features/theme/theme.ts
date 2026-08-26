import { db } from '@/data';

/**
 * Aplicar el tema es reescribir variables en el elemento raiz: sin
 * recompilar, sin re-render de React, y las graficas SVG se enteran solas.
 * Ver docs/diseno/panel-tema.md.
 */

export interface Appearance {
  /** Ausencia de valor significa seguir al sistema. */
  theme: 'light' | 'dark' | 'system';
  accent: string;
  font: 'sans' | 'serif' | 'mono';
  motion: boolean;
}

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'system',
  accent: '#0d7dd4',
  font: 'sans',
  motion: true,
};

/** La densidad es lo unico que difiere legitimamente entre un movil y un monitor. */
export type Density = 'comfortable' | 'compact';

export function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement;
  if (appearance.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', appearance.theme);

  root.style.setProperty('--color-accent', appearance.accent);
  root.style.setProperty('--font-family', `var(--font-${appearance.font})`);
  if (appearance.motion) {
    root.style.removeProperty('--duration-fast');
    root.style.removeProperty('--duration-base');
    root.style.removeProperty('--duration-slow');
  } else {
    root.style.setProperty('--duration-fast', '0ms');
    root.style.setProperty('--duration-base', '0ms');
    root.style.setProperty('--duration-slow', '0ms');
  }

  // La barra de estado del sistema acompaña al tema, no a la paleta.
  const meta = document.querySelector('meta[name="theme-color"]');
  const dark =
    appearance.theme === 'dark' ||
    (appearance.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  meta?.setAttribute('content', dark ? '#162330' : '#f8fafc');
}

export function applyDensity(density: Density): void {
  document.documentElement.setAttribute('data-density', density);
}

export function readAppearance(value: unknown): Appearance {
  if (value === null || typeof value !== 'object') return DEFAULT_APPEARANCE;
  return { ...DEFAULT_APPEARANCE, ...(value as Partial<Appearance>) };
}

export async function saveAppearance(appearance: Appearance): Promise<void> {
  // Va en settings, que es lo que viaja entre dispositivos.
  await db.settings.put({ key: 'appearance', value: appearance });
}

export async function saveDensity(density: Density): Promise<void> {
  // Aparte y sin sincronizar: imponer al iPad la densidad del escritorio
  // seria un fastidio, no una funcionalidad.
  await db.settings.put({ key: 'density', value: density });
}
