/**
 * El modulo virtual del plugin de PWA no existe fuera del build de Vite, asi
 * que en tests se sustituye por este doble.
 */
export function registerSW(): (reload?: boolean) => Promise<void> {
  return () => Promise.resolve();
}
