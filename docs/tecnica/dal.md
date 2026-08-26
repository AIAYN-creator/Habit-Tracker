---
description: Repositorios de lectura/escritura sobre Dexie y migraciones entre versiones.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
	# Capa de acceso a datos

Único punto por el que se lee y se escribe en IndexedDB. Ningún componente importa Dexie: lo
prohíbe la regla de dependencias de `stack` y lo verifica el lint de `tooling`.

No es purismo. Hay tres cosas que **tienen que pasar en toda escritura** y que, si cada
componente escribiera por su cuenta, se olvidarían en el sitio menos oportuno: sellar
`updatedAt`, encolar el cambio en `outbox` y hacer ambas cosas en la misma transacción.

## Superficie

```
habits      list() | listActive() | get(id) | create(draft) | update(id, patch)
            | archive(id) | reorder(ids)
moods       (idéntico, sobre dimensiones)
entries     get(date) | range(from, to) | setValue(date, kind, key, value)
            | setNote(date, text) | clearValue(date, kind, key)
settings    get(key) | set(key, value) | all()
outbox      pending() | markSent(ids) | enqueue(change)
```

`entries` no expone un `save(entry)` completo, y es deliberado: el registro diario escribe **un
valor cada vez** —eso es lo que decide `flujos` al eliminar el botón de guardar—, así que la
operación natural es `setValue`, no reemplazar el día entero. Reemplazar el día entero desde la
UI es justo lo que provoca que dos pestañas abiertas se pisen.

## Toda escritura, en una transacción

```js
async function setValue(date, kind, key, value) {
  return db.transaction('rw', db.entries, db.outbox, async () => {
    const entry = (await db.entries.get(date)) ?? newEntry(date);
    entry[kind][key] = value;
    entry.updatedAt = nowIso();
    await db.entries.put(entry);
    await db.outbox.add({ path: pathFor(date), createdAt: entry.updatedAt });
  });
}
```

Dos detalles que no son adorno: `updatedAt` se sella **aquí y en ningún otro sitio**, porque es el
insumo del LWW de `adr-sync` y un timestamp escrito desde dos lugares distintos acaba divergiendo;
y la cola se escribe dentro de la misma transacción, porque una entrada guardada que no se encoló
es un dato que nunca llega a GitHub.

## Borrar un valor no es ponerlo a cero

`clearValue` **elimina la clave**; no escribe `false` ni `0`. Es la distinción que `modelo`
protege —ausencia de clave significa "no registrado"— y el sitio donde se rompería es
precisamente este.

## Fechas

Todo lo que convierta entre `Date` y `YYYY-MM-DD` vive en `lib/date`, no aquí y no en los
componentes. La regla de `modelo` es que el día es local, así que la conversión usa la hora local
del dispositivo y nunca `toISOString()`, que devuelve UTC y desplaza el día para media Europa a
partir de las dos de la madrugada. Es el error clásico y merece una función con nombre propio y
sus tests.

## Identificadores

`nanoid` de ocho caracteres con prefijo por tipo: `h_` para hábitos, `m_` para dimensiones. El
prefijo no aporta nada al programa y mucho a quien lea un JSON del repo a mano.

## Migraciones

Dos versionados distintos, que ya distinguía `dexie` y que se implementan aquí:

- **Versión de Dexie** — cambia la forma de las tablas del navegador. Migración con la función
  `upgrade` de Dexie.
- **`schemaVersion`** — cambia el formato de los ficheros JSON. Migración al leer, en la capa de
  serialización.

Una sube sin que la otra se entere. Mezclarlas obligaría a migrar la base local por un cambio que
sólo afecta al repo.

## Pruebas

Con `fake-indexeddb`, que permite probar en Node sin navegador. Es la capa con más densidad de
tests de todo el proyecto, y las tres zonas obligatorias de `tooling` caen casi enteras aquí:
fechas, atomicidad de las escrituras y compatibilidad de schema.

## Criterios de aceptación

- [ ] Ningún fichero fuera de `src/data` importa Dexie. Verificado por lint.
- [ ] `updatedAt` se escribe en un único punto del código.
- [ ] Un fallo forzado a mitad de `setValue` no deja entrada guardada sin su registro en `outbox`.
- [ ] `clearValue` elimina la clave y no escribe un valor falso. Con test.
- [ ] Las conversiones de fecha pasan tests en zonas horarias distintas y en cambio de horario.
- [ ] `range()` de un mes no carga el año entero en memoria.
