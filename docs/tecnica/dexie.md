---
description: 'Dexie: definición de tablas, índices y versionado del esquema local.'
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Setup de IndexedDB

IndexedDB es la fuente de verdad del dispositivo. Los JSON del repo de GitHub son una
**proyección** de esto, no al revés. Si los dos discrepan, `sync` decide con las reglas de
`adr-sync`; mientras tanto, la app lee y escribe aquí y sólo aquí.

## Base de datos

Nombre `habits`, gestionada con Dexie.

### Tablas

| Tabla | Clave primaria | Índices | Contenido |
|---|---|---|---|
| `habits` | `id` | `order`, `archivedAt` | Definiciones de hábito de `modelo` |
| `moodDimensions` | `id` | `order`, `archivedAt` | Dimensiones de mood |
| `entries` | `date` | `updatedAt` | Una fila por día |
| `settings` | `key` | — | Tema, densidad, preferencias de visualización |
| `outbox` | `++id` | `createdAt` | Cambios pendientes de empujar a GitHub |
| `syncState` | `key` | — | Último commit visto, última sincronización, estado del token |

### Por qué `date` es la clave primaria de `entries`

La fecha en formato `YYYY-MM-DD` es única por definición, ordena lexicográficamente igual que
cronológicamente, y coincide con el nombre del fichero en el repo. Eso hace que el rango de un
mes sea `entries.where('date').between('2026-08-01', '2026-08-31')` sin índice adicional, y que
la correspondencia con el repo sea uno a uno sin tabla de traducción.

Un `++id` autoincremental aquí no aportaría nada y abriría la puerta a dos filas para el mismo
día, que es el bug que nadie quiere depurar.

### Por qué una fila por día y no una por medición

Sería tentador tener `measurements(date, habitId, value)`. Se descarta: la unidad de edición, de
sincronización y de conflicto es el día completo. Una fila por medición multiplica por diez el
número de registros, complica el last-write-wins de `adr-sync` —¿el timestamp es del día o de
cada valor?— y no compra ninguna consulta que no se resuelva bien con la forma actual.

## Versionado del esquema

```js
db.version(1).stores({
  habits: 'id, order, archivedAt',
  moodDimensions: 'id, order, archivedAt',
  entries: 'date, updatedAt',
  settings: 'key',
  outbox: '++id, createdAt',
  syncState: 'key',
});
```

Reglas:

- La versión de Dexie sólo sube, y cada subida lleva su función `upgrade`.
- **La versión de Dexie no es el `schemaVersion` de `modelo`.** Una cambia cuando cambia la forma
  de las tablas del navegador; la otra cuando cambia el formato de los ficheros JSON. Confundirlas
  llevaría a migrar datos que no lo necesitan. Se documentan las dos por separado en `dal`.
- Toda migración se prueba con una base de datos poblada, no vacía. Una migración que sólo se ha
  ejecutado sobre cero filas no se ha probado.

## Lectura reactiva

`dexie-react-hooks` con `useLiveQuery`. La UI se suscribe a la consulta y Dexie la reejecuta
cuando cambian los datos, sin capa de caché intermedia ni invalidación manual.

Dos consecuencias que conviene tener presentes al escribir componentes: la primera ejecución
devuelve `undefined` —hay que distinguir "cargando" de "vacío", y no es lo mismo en la UI— y la
consulta se reejecuta ante cualquier escritura en las tablas implicadas, así que conviene
acotarla por rango en lugar de traerse todo y filtrar en JavaScript.

## Escrituras

- Toda escritura pasa por `dal`; ningún componente llama a Dexie directamente. Es lo que permite
  que `dal` selle `updatedAt` y encole en `outbox` en la misma transacción.
- Las operaciones que tocan varias tablas van en `db.transaction('rw', ...)`. En particular,
  guardar una entrada y encolar su envío son atómicas: una entrada guardada que no se encoló es
  un dato que no llega nunca a GitHub.

## Almacenamiento persistente

`navigator.storage.persist()` se solicita en el primer arranque desde `pwa`. Aquí se añade la
comprobación de cuota con `navigator.storage.estimate()`, expuesta en ajustes. Con ~1 kB por día,
el límite no es un problema real, pero saber que la app puede consultarlo evita sustos.

## Criterios de aceptación

- [ ] La base de datos se crea en el primer arranque con las seis tablas.
- [ ] `useLiveQuery` sobre el mes actual se actualiza al guardar una entrada, sin recargar.
- [ ] Guardar entrada y encolar en `outbox` ocurren en una única transacción, verificado con un
      test que fuerza un fallo a mitad.
- [ ] Existe un test de migración de la versión 1 a una versión 2 de prueba, con datos dentro.
- [ ] Queda documentada por escrito la diferencia entre versión de Dexie y `schemaVersion`.
