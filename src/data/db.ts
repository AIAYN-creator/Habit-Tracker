import Dexie, { type Table } from 'dexie';
import type { Entry, Habit, MoodDimension, OutboxItem, SettingRow, SyncBaseRow } from './types';

/**
 * IndexedDB es la fuente de verdad del dispositivo. Ver docs/tecnica/dexie.md.
 *
 * La version de Dexie no es el SCHEMA_VERSION del modelo: esta cambia cuando
 * cambia la forma de las tablas del navegador, aquella cuando cambia el formato
 * de los ficheros JSON del repo.
 */
export class HabitsDb extends Dexie {
  habits!: Table<Habit, string>;
  moodDimensions!: Table<MoodDimension, string>;
  entries!: Table<Entry, string>;
  settings!: Table<SettingRow, string>;
  outbox!: Table<OutboxItem, number>;
  syncState!: Table<SettingRow, string>;
  syncBase!: Table<SyncBaseRow, string>;

  constructor(name = 'habits') {
    super(name);
    this.version(1).stores({
      habits: 'id, order, archivedAt',
      moodDimensions: 'id, order, archivedAt',
      entries: 'date, updatedAt',
      settings: 'key',
      outbox: '++id, createdAt',
      syncState: 'key',
      syncBase: 'path, syncedAt',
    });
  }
}

export const db = new HabitsDb();
