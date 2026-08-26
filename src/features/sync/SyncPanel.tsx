import { useState } from 'react';
import { db, useLiveQuery, type Conflict } from '@/data';
import { Button, Field, Input } from '@/ui';
import { createGitHubClient, GitHubError } from './github';
import { sync } from './engine';
import styles from './SyncPanel.module.css';

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
 * Conexion con GitHub y estado de la sincronizacion.
 * Ver docs/tecnica/auth-gh.md y docs/tecnica/estado-sync.md.
 */
export function SyncPanel() {
  const stored = useLiveQuery(() => db.settings.get('github'), []);
  const pending = useLiveQuery(() => db.outbox.count(), []);
  const state = useLiveQuery(() => db.syncState.toArray(), []);

  const credentials = isCredentials(stored?.value) ? stored.value : null;
  const lastSync = state?.find((row) => row.key === 'lastSyncAt')?.value;
  const conflictsRaw = state?.find((row) => row.key === 'conflicts')?.value;
  const conflicts: Conflict[] = Array.isArray(conflictsRaw) ? (conflictsRaw as Conflict[]) : [];

  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  async function connect() {
    const [owner, name] = repo.trim().split('/');
    if (!owner || !name) {
      setError('Escríbelo como usuario/repositorio.');
      return;
    }
    if (token.trim().length === 0) {
      setError('Falta el token.');
      return;
    }

    setBusy(true);
    setError(undefined);
    try {
      // Verificacion inmediata: si el token no sirve, se dice ahora y no al
      // primer intento de guardar datos.
      const client = createGitHubClient({ owner, repo: name, token: token.trim() });
      await client.getHead();
      await db.settings.put({ key: 'github', value: { owner, repo: name, token: token.trim() } });
      setToken('');
      setStatus('Conectado.');
    } catch (caught) {
      setError(caught instanceof GitHubError ? caught.message : 'No se pudo conectar con GitHub.');
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    if (!credentials) return;
    setBusy(true);
    setError(undefined);
    try {
      const report = await sync(createGitHubClient(credentials));
      setStatus(
        report.skipped
          ? 'Ya estaba al día.'
          : `${String(report.pushed)} enviados, ${String(report.pulled)} recibidos.`,
      );
    } catch (caught) {
      setError(caught instanceof GitHubError ? caught.message : 'La sincronización falló.');
    } finally {
      setBusy(false);
    }
  }

  if (!credentials) {
    return (
      <div className={styles.panel}>
        <ol className={styles.steps}>
          <li>
            Crea un repositorio <strong>privado</strong> para tus datos. Los repos privados de
            GitHub son gratis.
          </li>
          <li>
            Genera un{' '}
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noreferrer"
            >
              token de grano fino
            </a>{' '}
            acotado <strong>sólo a ese repositorio</strong>, con el permiso{' '}
            <strong>Contents: read and write</strong>.
          </li>
          <li>Pégalo aquí. Se guarda en este dispositivo y no sale de él.</li>
        </ol>

        <Field label="Repositorio" hint="usuario/repositorio">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={repo}
              placeholder="tu-usuario/habit-tracker-data"
              onChange={(event) => {
                setRepo(event.target.value);
              }}
            />
          )}
        </Field>

        <Field label="Token" error={error}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="password"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={token}
              placeholder="github_pat_…"
              onChange={(event) => {
                setToken(event.target.value);
              }}
            />
          )}
        </Field>

        <Button variant="primary" disabled={busy} onClick={() => void connect()}>
          {busy ? 'Comprobando…' : 'Conectar'}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.line}>
        Conectado a <strong>{`${credentials.owner}/${credentials.repo}`}</strong>
      </p>
      <p className={styles.muted}>
        {typeof lastSync === 'string'
          ? `Última sincronización: ${new Date(lastSync).toLocaleString('es-ES')}`
          : 'Todavía no se ha sincronizado'}
        {pending ? ` · ${String(pending)} cambios pendientes` : ''}
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {status ? <p className={styles.muted}>{status}</p> : null}

      <div className={styles.actions}>
        <Button variant="primary" disabled={busy} onClick={() => void syncNow()}>
          {busy ? 'Sincronizando…' : 'Sincronizar ahora'}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            void db.settings.delete('github');
          }}
        >
          Desconectar
        </Button>
      </div>

      <p className={styles.muted}>
        Desconectar borra el token de este dispositivo, pero sigue vivo en GitHub hasta que lo
        revoques allí. Tus datos locales no se tocan.
      </p>

      {conflicts.length > 0 ? (
        <div className={styles.conflicts}>
          <p className={styles.line}>Conflictos resueltos</p>
          {conflicts.slice(-5).map((conflict, index) => (
            <p key={`${conflict.key}-${String(index)}`} className={styles.muted}>
              {conflict.key}: se conservó {JSON.stringify(conflict.kept)} y se descartó{' '}
              {JSON.stringify(conflict.discarded)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
