import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

/**
 * Suscripcion reactiva a una consulta de Dexie.
 *
 * Propio y no `dexie-react-hooks`: con aquel paquete la primera consulta
 * devolvia datos y despues la UI se quedaba congelada hasta recargar. No llegue
 * a aislar la causa exacta, asi que en lugar de convivir con una dependencia
 * que no entiendo, quince lineas sobre `liveQuery` de Dexie, verificadas en el
 * navegador contra el bundle de produccion.
 *
 * Devuelve `undefined` mientras carga, que no es lo mismo que vacio.
 */
export function useLiveQuery<T>(querier: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (result) => {
        setValue(() => result);
      },
      error: (error: unknown) => {
        console.error('Consulta reactiva fallida', error);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
    // El querier se recrea en cada render: las dependencias reales las declara quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
