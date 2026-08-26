import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, entries, schema, stableStringify } from '@/data';
import type { GitHubClient } from './github';
import { sync } from './engine';

/** Cliente falso: el ciclo se prueba entero sin tocar la red. */
function fakeClient(overrides: Partial<GitHubClient> = {}): GitHubClient {
  return {
    getHead: vi.fn(async () => null),
    listFiles: vi.fn(async () => []),
    readBlob: vi.fn(async () => '{}'),
    push: vi.fn(async () => 'commit-1'),
    ...overrides,
  };
}

beforeEach(async () => {
  await Promise.all([
    db.entries.clear(),
    db.habits.clear(),
    db.moodDimensions.clear(),
    db.outbox.clear(),
    db.syncBase.clear(),
    db.syncState.clear(),
  ]);
});

describe('sync', () => {
  it('sin cambios locales ni remotos, no hace nada', async () => {
    await db.syncState.put({ key: 'head', value: 'abc' });
    const client = fakeClient({ getHead: vi.fn(async () => 'abc') });

    const report = await sync(client);

    expect(report.skipped).toBe(true);
    expect(client.push).not.toHaveBeenCalled();
    expect(client.listFiles).not.toHaveBeenCalled();
  });

  it('empuja una semana de cambios offline en un solo commit', async () => {
    for (const date of ['2026-08-20', '2026-08-21', '2026-08-22']) {
      await entries.setValue(date, 'habits', 'h_run', 30);
      await entries.setValue(date, 'habits', 'h_read', true);
    }
    const client = fakeClient();

    const report = await sync(client);

    expect(client.push).toHaveBeenCalledTimes(1);
    const files = vi.mocked(client.push).mock.calls[0]?.[0].files ?? [];
    expect(files).toHaveLength(3);
    expect(report.commit).toBe('commit-1');
  });

  it('vacia la cola solo despues de empujar', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 30);
    expect(await db.outbox.count()).toBe(1);

    await sync(fakeClient());

    expect(await db.outbox.count()).toBe(0);
  });

  it('deja la cola intacta si el empuje falla', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 30);
    const client = fakeClient({
      push: vi.fn(() => Promise.reject(new Error('sin red'))),
    });

    await expect(sync(client)).rejects.toThrow('sin red');
    expect(await db.outbox.count()).toBe(1);
  });

  it('trae una entrada remota que no existe en local', async () => {
    const remota = stableStringify({
      date: '2026-08-25',
      schemaVersion: 1,
      habits: { h_run: 40 },
      moods: {},
      createdAt: '2026-08-25T20:00:00Z',
      updatedAt: '2026-08-25T20:00:00Z',
    });
    const client = fakeClient({
      getHead: vi.fn(async () => 'head-1'),
      listFiles: vi.fn(async () => [{ path: 'entries/2026/2026-08-25.json', sha: 'blob-1' }]),
      readBlob: vi.fn(async () => remota),
    });

    await sync(client);

    expect((await db.entries.get('2026-08-25'))?.habits).toEqual({ h_run: 40 });
  });

  it('fusiona claves distintas del mismo dia sin perder ninguna', async () => {
    await entries.setValue('2026-08-25', 'habits', 'h_read', true);
    await db.syncBase.put({
      path: 'entries/2026/2026-08-25.json',
      content: stableStringify({ date: '2026-08-25', habits: {}, moods: {} }),
      sha: 'blob-0',
      syncedAt: '2026-08-25T10:00:00Z',
    });

    const client = fakeClient({
      getHead: vi.fn(async () => 'head-2'),
      listFiles: vi.fn(async () => [{ path: 'entries/2026/2026-08-25.json', sha: 'blob-1' }]),
      readBlob: vi.fn(async () =>
        stableStringify({
          date: '2026-08-25',
          habits: { h_run: 40 },
          moods: {},
          updatedAt: '2099-01-01T00:00:00Z',
        }),
      ),
    });

    await sync(client);

    // El movil marco leer, el otro dispositivo corrio: se quedan los dos.
    expect(await db.entries.get('2026-08-25')).toMatchObject({
      habits: { h_read: true, h_run: 40 },
    });
  });

  it('no lanza dos ciclos a la vez', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 30);
    const client = fakeClient();

    const [a, b] = await Promise.all([sync(client), sync(client)]);

    expect(client.push).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('empuja tambien el schema al crear un habito', async () => {
    await schema.createHabit({
      name: 'Correr',
      type: 'boolean',
      config: {},
      frequency: { kind: 'daily' },
      color: '#000000',
    });
    const client = fakeClient();

    await sync(client);

    const files = vi.mocked(client.push).mock.calls[0]?.[0].files ?? [];
    expect(files.map((file) => file.path)).toContain('schemas/habits.json');
  });
});
