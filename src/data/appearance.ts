import { db } from './db';
import { enqueue } from './entries';

/**
 * Lo que se guarda de la apariencia.
 *
 * Vive en data/ y no en la feature porque lo leen dos —el panel y las
 * graficas—, y una feature no puede importar de otra.
 */

export interface Appearance {
  /** Ausencia de valor significa seguir al sistema. */
  theme: 'light' | 'dark' | 'system';
  accent: string;
  font: 'sans' | 'serif' | 'mono';
  motion: boolean;
  /**
   * Preferencias que valen para todas las graficas a la vez. Lo que tiene
   * sentido responder **por metrica** —el tipo de grafica— vive en el schema,
   * no aqui. Ver docs/adr/charts.md.
   */
  chartCurve: 'smooth' | 'step';
  chartGrid: boolean;
  cellRadius: 'rounded' | 'sharp';
}

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'system',
  accent: '#0d7dd4',
  font: 'sans',
  motion: true,
  chartCurve: 'smooth',
  chartGrid: false,
  cellRadius: 'rounded',
};

/** La densidad es lo unico que difiere legitimamente entre un movil y un monitor. */
export type Density = 'comfortable' | 'compact';

export function readAppearance(value: unknown): Appearance {
  if (value === null || typeof value !== 'object') return DEFAULT_APPEARANCE;
  return { ...DEFAULT_APPEARANCE, ...(value as Partial<Appearance>) };
}

export async function saveAppearance(appearance: Appearance): Promise<void> {
  // Va en settings y se encola: es lo que viaja entre dispositivos.
  const now = new Date().toISOString();
  await db.transaction('rw', db.settings, db.outbox, async () => {
    await db.settings.put({ key: 'appearance', value: { ...appearance, updatedAt: now } });
    await enqueue('settings.json', now);
  });
}

export async function saveDensity(density: Density): Promise<void> {
  // Aparte y **sin encolar**: imponer al iPad la densidad del escritorio seria
  // un fastidio, no una funcionalidad.
  await db.settings.put({ key: 'density', value: density });
}
