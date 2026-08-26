/**
 * Contraste entre dos colores. Ver docs/diseno/a11y.md.
 *
 * La app deja al usuario elegir colores, asi que puede romper su propio
 * contraste. La regla es avisar sin bloquear: es su app. Lo que si es
 * automatico es el color del texto sobre un relleno.
 */

/** Acepta #rgb y #rrggbb. */
export function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function channel(value: number): number {
  const ratio = value / 255;
  return ratio <= 0.03928 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(channel) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** De 1 a 21. WCAG AA pide 4.5 en texto normal y 3 en elementos de interfaz. */
export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Texto claro u oscuro sobre un relleno, calculado y nunca a la suerte.
 * Es lo que impide que un acento amarillo deje el texto invisible.
 */
export function textOn(background: string): '#ffffff' | '#111111' {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#111111')
    ? '#ffffff'
    : '#111111';
}
