import { useEffect, useRef } from 'react';
import { db, useLiveQuery } from '@/data';
import { createGitHubClient, GitHubError } from './github';
import { sync } from './engine';

/** Espaciados y con techo: nada de bucle apretado contra la API de nadie. */
const BACKOFF = [30_000, 120_000, 600_000];

interface Credentials {
  owner: string;
  repo: string;
  token: string;
}

function isCredentials(value: unknown): value is Credentials {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Partial<Credentials>;
  return (
    typeof candidate.owner === 'string' &&
    typeof candidate.repo === 'string' &&
    typeof candidate.token === 'string'
  );
}

/**
 * Vacia la cola sola. Ver docs/tecnica/cola.md.
 *
 * Se dispara al abrir la app, al recuperar la red y al volver del segundo
 * plano. **Nunca al escribir**: registrar un habito no debe lanzar una peticion
 * que compita con el siguiente toque.
 */
export function useAutoSync(): void {
  const stored = useLiveQuery(() => db.settings.get('github'), []);
  const credentials = isCredentials(stored?.value) ? stored.value : null;
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!credentials) return;
    let alive = true;

    function schedule(delay: number) {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        void attemptSync();
      }, delay);
    }

    async function attemptSync() {
      if (!alive || !credentials || !navigator.onLine) return;
      try {
        await sync(createGitHubClient(credentials));
        attempt.current = 0;
      } catch (error) {
        // Token caducado o permiso perdido: reintentar solo gasta cuota y
        // bateria. Requiere que el usuario actue, y el panel ya lo dice.
        if (error instanceof GitHubError && [401, 403, 404].includes(error.status)) return;
        const delay = BACKOFF[Math.min(attempt.current, BACKOFF.length - 1)] ?? 600_000;
        attempt.current += 1;
        schedule(delay);
      }
    }

    function reset() {
      // Al cambiar la condicion, se reintenta ya: quien vuelve a tener red no
      // espera a que venza un temporizador interno.
      attempt.current = 0;
      void attemptSync();
    }

    void attemptSync();
    window.addEventListener('online', reset);
    document.addEventListener('visibilitychange', onVisible);

    function onVisible() {
      if (document.visibilityState === 'visible') reset();
    }

    return () => {
      alive = false;
      window.clearTimeout(timer.current);
      window.removeEventListener('online', reset);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [credentials]);
}
