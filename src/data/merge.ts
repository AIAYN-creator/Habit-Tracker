/**
 * Fusion a tres bandas. Ver docs/adr/adr-sync.md.
 *
 * El last-write-wins de fichero entero pierde datos en un caso cotidiano:
 * marcar un habito en el movil y otro en el iPad antes de sincronizar. Con la
 * base —la ultima version que ambos lados compartieron— se puede saber quien
 * cambio que, y el LWW solo entra donde los dos tocaron la misma clave.
 */

export interface Conflict {
  key: string;
  kept: unknown;
  discarded: unknown;
  keptFrom: 'local' | 'remote';
}

export interface MergeResult<T> {
  merged: T;
  conflicts: Conflict[];
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Fusiona tres versiones de un objeto plano, clave a clave.
 *
 * `remoteWins` decide solo en la colision real: cuando ambos lados cambiaron la
 * misma clave a valores distintos. Lo determina el `updatedAt` de la entrada.
 */
export function mergeRecords<T extends Record<string, unknown>>(
  base: T | undefined,
  local: T,
  remote: T,
  remoteWins: boolean,
  prefix = '',
): MergeResult<T> {
  const merged: Record<string, unknown> = {};
  const conflicts: Conflict[] = [];
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const baseline: Record<string, unknown> = base ?? {};

  for (const key of keys) {
    const inLocal = Object.prototype.hasOwnProperty.call(local, key);
    const inRemote = Object.prototype.hasOwnProperty.call(remote, key);
    const localValue = local[key];
    const remoteValue = remote[key];
    const baseValue = baseline[key];

    const localChanged = !same(localValue, baseValue) || !inLocal;
    const remoteChanged = !same(remoteValue, baseValue) || !inRemote;

    // Borrado: la clave existia en la base y uno de los dos la quito.
    if (!inLocal && inRemote) {
      const baseHadIt = Object.prototype.hasOwnProperty.call(baseline, key);
      if (baseHadIt && same(remoteValue, baseValue)) continue; // borrado en local
      merged[key] = remoteValue;
      continue;
    }
    if (inLocal && !inRemote) {
      const baseHadIt = Object.prototype.hasOwnProperty.call(baseline, key);
      if (baseHadIt && same(localValue, baseValue)) continue; // borrado en remoto
      merged[key] = localValue;
      continue;
    }

    if (same(localValue, remoteValue)) {
      merged[key] = localValue;
      continue;
    }
    if (localChanged && !remoteChanged) {
      merged[key] = localValue;
      continue;
    }
    if (remoteChanged && !localChanged) {
      merged[key] = remoteValue;
      continue;
    }

    // Ambos tocaron la misma clave: aqui, y solo aqui, decide el timestamp.
    merged[key] = remoteWins ? remoteValue : localValue;
    conflicts.push({
      key: `${prefix}${key}`,
      kept: remoteWins ? remoteValue : localValue,
      discarded: remoteWins ? localValue : remoteValue,
      keptFrom: remoteWins ? 'remote' : 'local',
    });
  }

  return { merged: merged as T, conflicts };
}
