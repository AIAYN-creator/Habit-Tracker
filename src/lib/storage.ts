import { useEffect, useState } from 'react';

/**
 * Almacenamiento persistente del navegador.
 *
 * iOS borra el almacenamiento de los sitios que no se visitan en siete dias.
 * Para una app cuya fuente de verdad es IndexedDB eso es perdida de datos
 * silenciosa por irse de vacaciones. Instalada en la pantalla de inicio, el
 * permiso suele concederse. Ver docs/tecnica/pwa.md.
 *
 * Vive en lib/ y no en una feature porque lo consultan dos, y una feature no
 * puede importar de otra.
 *
 * Devuelve null si el navegador no lo soporta o no se pudo comprobar.
 */
export function usePersistentStorage(): boolean | null {
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    // navigator.storage no existe en todos los entornos: sin la guarda, leer
    // .persist revienta la app entera.
    // El tipo de TypeScript afirma que navigator.storage siempre existe, y no
    // es cierto: en jsdom y en navegadores viejos es undefined, y leerlo sin
    // guarda revienta la app entera. Lo cazo un test de accesibilidad.
    const storage = navigator.storage as StorageManager | undefined;
    if (typeof storage?.persist !== 'function') return;
    void storage
      .persisted()
      .then((already) => (already ? true : storage.persist()))
      .then(setPersisted)
      .catch(() => {
        setPersisted(null);
      });
  }, []);

  return persisted;
}
