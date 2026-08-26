import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from './db';
import * as entries from './entries';

beforeEach(async () => {
  await Promise.all([db.entries.clear(), db.outbox.clear()]);
});

describe('setValue', () => {
  it('crea la entrada del dia si no existia', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 35);
    const entry = await entries.get('2026-08-26');
    expect(entry?.habits['h_run']).toBe(35);
  });

  it('no pisa los valores ya registrados de ese dia', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 35);
    await entries.setValue('2026-08-26', 'habits', 'h_read', true);
    const entry = await entries.get('2026-08-26');
    expect(entry?.habits).toEqual({ h_run: 35, h_read: true });
  });

  it('encola la ruta del fichero en la misma operacion', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 35);
    const queued = await db.outbox.toArray();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.path).toBe('entries/2026/2026-08-26.json');
  });

  it('cinco escrituras del mismo dia dejan un solo elemento en la cola', async () => {
    for (const value of [10, 20, 30, 40, 50]) {
      await entries.setValue('2026-08-26', 'habits', 'h_run', value);
    }
    expect(await db.outbox.count()).toBe(1);
  });

  it('dias distintos se encolan por separado', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 10);
    await entries.setValue('2026-08-27', 'habits', 'h_run', 10);
    expect(await db.outbox.count()).toBe(2);
  });

  it('sella updatedAt en cada escritura', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_run', 35);
    const first = await entries.get('2026-08-26');
    await new Promise((resolve) => setTimeout(resolve, 5));
    await entries.setValue('2026-08-26', 'habits', 'h_run', 40);
    const second = await entries.get('2026-08-26');
    expect(second?.updatedAt).not.toBe(first?.updatedAt);
    expect(second?.createdAt).toBe(first?.createdAt);
  });
});

describe('atomicidad', () => {
  it('un fallo al encolar no deja la entrada guardada', async () => {
    const add = vi.spyOn(db.outbox, 'add').mockRejectedValueOnce(new Error('sin espacio'));

    await expect(entries.setValue('2026-08-26', 'habits', 'h_run', 35)).rejects.toThrow();

    // Si esto fallara, habria un dato local que nunca llegaria a GitHub.
    expect(await entries.get('2026-08-26')).toBeUndefined();
    add.mockRestore();
  });
});

describe('clearValue', () => {
  it('elimina la clave y no escribe un valor falso', async () => {
    await entries.setValue('2026-08-26', 'habits', 'h_read', true);
    await entries.clearValue('2026-08-26', 'habits', 'h_read');

    const entry = await entries.get('2026-08-26');
    // "no registrado" no es lo mismo que false: la clave no debe existir.
    expect(entry?.habits).not.toHaveProperty('h_read');
    expect(Object.keys(entry?.habits ?? {})).toHaveLength(0);
  });
});

describe('setNote', () => {
  it('guarda la nota y la quita al vaciarla', async () => {
    await entries.setNote('2026-08-26', 'Dia raro pero bien.');
    expect((await entries.get('2026-08-26'))?.note).toBe('Dia raro pero bien.');

    await entries.setNote('2026-08-26', '');
    expect(await entries.get('2026-08-26')).not.toHaveProperty('note');
  });
});

describe('range', () => {
  it('devuelve solo los dias del rango, inclusive', async () => {
    for (const date of ['2026-07-31', '2026-08-01', '2026-08-15', '2026-08-31', '2026-09-01']) {
      await entries.setValue(date, 'habits', 'h_run', 10);
    }
    const august = await entries.range('2026-08-01', '2026-08-31');
    expect(august.map((entry) => entry.date)).toEqual(['2026-08-01', '2026-08-15', '2026-08-31']);
  });
});

describe('pathForDate', () => {
  it('agrupa por ano, como fija adr-repo', () => {
    expect(entries.pathForDate('2027-01-01')).toBe('entries/2027/2027-01-01.json');
  });
});
