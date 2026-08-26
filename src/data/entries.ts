import { db } from './db';
import { yearOf } from '@/lib/date';
import { SCHEMA_VERSION, type DateKey, type Entry, type EntryKind } from './types';

/**
 * Toda escritura pasa por aqui. Ver docs/tecnica/dal.md.
 *
 * Tres cosas ocurren juntas o no ocurren: se escribe el valor, se sella
 * updatedAt y se encola la ruta en outbox. En la misma transaccion, porque una
 * entrada guardada que no se encolo es un dato que nunca llega a GitHub.
 */

function nowIso(): string {
  return new Date().toISOString();
}

/** La ruta del fichero de un dia en el repo de datos. */
export function pathForDate(date: DateKey): string {
  return `entries/${yearOf(date)}/${date}.json`;
}

/**
 * Se encola la **ruta**, no el contenido, y sin repetir.
 *
 * Tocar el mismo dia cinco veces sin red deja un elemento en la cola, no cinco
 * versiones del fichero: al empujar se lee el estado actual, que es lo que hay
 * que enviar.
 */
export async function enqueue(path: string, now: string): Promise<void> {
  const existing = await db.outbox.where('path').equals(path).first();
  if (existing?.id !== undefined) {
    await db.outbox.update(existing.id, { createdAt: now });
    return;
  }
  await db.outbox.add({ path, createdAt: now });
}

function emptyEntry(date: DateKey, now: string): Entry {
  return {
    date,
    schemaVersion: SCHEMA_VERSION,
    habits: {},
    moods: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function get(date: DateKey): Promise<Entry | undefined> {
  return db.entries.get(date);
}

/** Rango inclusivo, para el mes del calendario o el año del heatmap. */
export function range(from: DateKey, to: DateKey): Promise<Entry[]> {
  return db.entries.where('date').between(from, to, true, true).toArray();
}

async function mutate(date: DateKey, apply: (entry: Entry) => void): Promise<void> {
  await db.transaction('rw', db.entries, db.outbox, async () => {
    const now = nowIso();
    const entry = (await db.entries.get(date)) ?? emptyEntry(date, now);
    apply(entry);
    entry.updatedAt = now;
    await db.entries.put(entry);
    await enqueue(pathForDate(date), now);
  });
}

/** Registra un valor. El registro diario escribe un valor cada vez, no el dia entero. */
export async function setValue(
  date: DateKey,
  kind: EntryKind,
  key: string,
  value: Entry[EntryKind][string],
): Promise<void> {
  await mutate(date, (entry) => {
    entry[kind][key] = value;
  });
}

/**
 * Deja el valor como no registrado. **Elimina la clave**: no escribe false ni 0.
 * Es la distincion que separa "no lo hice" de "no lo anote".
 */
export async function clearValue(date: DateKey, kind: EntryKind, key: string): Promise<void> {
  await mutate(date, (entry) => {
    // Borrar la clave dinamica es justo lo que pide el modelo: "no registrado"
    // se representa por ausencia, no por un valor centinela.
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete entry[kind][key];
  });
}

export async function setNote(date: DateKey, text: string): Promise<void> {
  await mutate(date, (entry) => {
    if (text.length === 0) delete entry.note;
    else entry.note = text;
  });
}
