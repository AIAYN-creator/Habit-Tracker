import type { Appearance, Density } from '@/data';

/**
 * Aplicar el tema es reescribir variables en el elemento raiz: sin
 * recompilar, sin re-render de React, y las graficas SVG se enteran solas.
 * Ver docs/diseno/panel-tema.md.
 */

export function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement;
  if (appearance.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', appearance.theme);

  root.style.setProperty('--color-accent', appearance.accent);
  root.style.setProperty('--radius-sm', appearance.cellRadius === 'sharp' ? '0px' : '4px');
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
