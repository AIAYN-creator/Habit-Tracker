import {
  db,
  mergeRecords,
  parseJson,
  stableStringify,
  type Conflict,
  type Entry,
  type Habit,
  type MoodDimension,
} from '@/data';
import type { GitHubClient, RepoFile } from './github';

/**
 * El ciclo de sincronizacion. Ver docs/tecnica/sync.md.
 *
 * Nunca bloquea la interfaz y solo corre uno a la vez: abrir la app, tocar el
 * boton manual y volver del segundo plano pueden coincidir en el mismo segundo,
 * y tres ciclos contra la misma referencia generan conflictos que no existian.
 */

/** Lee una clave desconocida como texto, o nada si no lo es. */
function text(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

const HABITS_PATH = 'schemas/habits.json';
const MOODS_PATH = 'schemas/moods.json';

export interface SyncReport {
  pulled: number;
  pushed: number;
  conflicts: Conflict[];
  commit: string | null;
  skipped: boolean;
}

let running: Promise<SyncReport> | null = null;

export function sync(client: GitHubClient): Promise<SyncReport> {
  running ??= run(client).finally(() => {
    running = null;
  });
  return running;
}

async function readState(key: string): Promise<string | null> {
  const row = await db.syncState.get(key);
  return typeof row?.value === 'string' ? row.value : null;
}

async function run(client: GitHubClient): Promise<SyncReport> {
  const head = await client.getHead();
  const lastSeen = await readState('head');
  const pending = await db.outbox.toArray();
  const dirty = [...new Set(pending.map((item) => item.path))];

  if (head === lastSeen && dirty.length === 0) {
    return { pulled: 0, pushed: 0, conflicts: [], commit: null, skipped: true };
  }

  const conflicts: Conflict[] = [];
  let pulled = 0;

  if (head !== null && head !== lastSeen) {
    const files = await client.listFiles(head);
    for (const file of files) {
      const base = await db.syncBase.get(file.path);
      if (base?.content !== undefined && base.sha === file.sha) continue;
      const remote = await client.readBlob(file.sha);
      const result = await applyRemote(file.path, remote, base?.content);
      conflicts.push(...result.conflicts);
      if (result.changed) pulled += 1;
      await db.syncBase.put({
        path: file.path,
        content: remote,
        sha: file.sha,
        syncedAt: new Date().toISOString(),
      });
      if (result.rewrite) dirty.push(file.path);
    }
  }

  let commit: string | null = null;
  const paths = [...new Set(dirty)];

  if (paths.length > 0) {
    const files: RepoFile[] = [];
    for (const path of paths) {
      const content = await buildFile(path);
      if (content !== null) files.push({ path, content });
    }
    if (files.length > 0) {
      commit = await client.push({ parent: head, files, message: message(files) });
      await db.transaction('rw', db.outbox, db.syncBase, db.syncState, async () => {
        await db.outbox.bulkDelete(pending.map((item) => item.id).filter((id) => id !== undefined));
        for (const file of files) {
          await db.syncBase.put({
            path: file.path,
            content: file.content,
            syncedAt: new Date().toISOString(),
          });
        }
        await db.syncState.put({ key: 'head', value: commit });
      });
    }
  } else if (head !== null) {
    await db.syncState.put({ key: 'head', value: head });
  }

  await db.syncState.put({ key: 'lastSyncAt', value: new Date().toISOString() });
  if (conflicts.length > 0) {
    const previous = (await db.syncState.get('conflicts'))?.value;
    const list: Conflict[] = Array.isArray(previous) ? (previous as Conflict[]) : [];
    await db.syncState.put({ key: 'conflicts', value: [...list, ...conflicts].slice(-50) });
  }

  return { pulled, pushed: commit ? paths.length : 0, conflicts, commit, skipped: false };
}

function message(files: RepoFile[]): string {
  const entries = files.filter((file) => file.path.startsWith('entries/'));
  if (files.length === 1 && entries.length === 1) {
    return `sync: entrada del ${entries[0]?.path.slice(-15, -5) ?? ''}`;
  }
  if (entries.length === 0) return 'sync: schema actualizado';
  return `sync: ${String(entries.length)} entradas`;
}

/** Fusiona lo remoto con lo local. Devuelve si hay que reescribir el fichero. */
async function applyRemote(
  path: string,
  raw: string,
  baseRaw: string | undefined,
): Promise<{ conflicts: Conflict[]; changed: boolean; rewrite: boolean }> {
  const remote = parseJson(raw, path);
  const base = baseRaw === undefined ? undefined : parseJson(baseRaw, path);

  if (path.startsWith('entries/')) {
    const date = text(remote['date']) ?? path.slice(-15, -5);
    const local = await db.entries.get(date);
    if (!local) {
      await db.entries.put(remote as unknown as Entry);
      return { conflicts: [], changed: true, rewrite: false };
    }

    const remoteWins = (text(remote['updatedAt']) ?? '') > local.updatedAt;
    const habits = mergeRecords(
      base?.['habits'] as Record<string, unknown> | undefined,
      local.habits,
      (remote['habits'] ?? {}) as Record<string, unknown>,
      remoteWins,
    );
    const moods = mergeRecords(
      base?.['moods'] as Record<string, unknown> | undefined,
      local.moods,
      (remote['moods'] ?? {}) as Record<string, unknown>,
      remoteWins,
    );

    const merged: Entry = {
      ...local,
      habits: habits.merged as Entry['habits'],
      moods: moods.merged as Entry['moods'],
      note: remoteWins ? ((remote['note'] as string | undefined) ?? local.note) : local.note,
      updatedAt: remoteWins ? (text(remote['updatedAt']) ?? local.updatedAt) : local.updatedAt,
    };
    await db.entries.put(merged);
    return { conflicts: [...habits.conflicts, ...moods.conflicts], changed: true, rewrite: true };
  }

  // Los schemas se fusionan por id, con las mismas reglas.
  const table = path === HABITS_PATH ? db.habits : db.moodDimensions;
  const key = path === HABITS_PATH ? 'habits' : 'dimensions';
  const remoteList = (remote[key] ?? []) as (Habit | MoodDimension)[];
  const localList = await table.toArray();
  const localById = new Map(localList.map((item) => [item.id, item]));

  let changed = false;
  for (const item of remoteList) {
    const mine = localById.get(item.id);
    if (!mine || item.updatedAt > mine.updatedAt) {
      await table.put(item as never);
      changed = true;
    }
  }
  const remoteIds = new Set(remoteList.map((item) => item.id));
  const rewrite = localList.some((item) => !remoteIds.has(item.id));
  return { conflicts: [], changed, rewrite };
}

/** Reconstruye el contenido del fichero desde la base local. */
async function buildFile(path: string): Promise<string | null> {
  if (path === HABITS_PATH) {
    return stableStringify({
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      habits: await db.habits.toArray(),
    });
  }
  if (path === MOODS_PATH) {
    return stableStringify({
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      dimensions: await db.moodDimensions.toArray(),
    });
  }
  const date = path.slice(-15, -5);
  const entry = await db.entries.get(date);
  return entry ? stableStringify(entry) : null;
}
