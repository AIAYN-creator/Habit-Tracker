import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/** Estado de las actualizaciones del service worker. Ver docs/tecnica/pwa.md. */
export interface PwaState {
  needsRefresh: boolean;
  update: () => void;
}

export function usePwa(): PwaState {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  // En una ref y no en estado: la funcion de recarga no se pinta, asi que
  // guardarla con setState solo provocaria un render de mas.
  const refresh = useRef<((reload: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    refresh.current = registerSW({
      onNeedRefresh() {
        setNeedsRefresh(true);
      },
    });
  }, []);

  const update = useCallback(() => {
    void refresh.current?.(true);
  }, []);

  return { needsRefresh, update };
}
