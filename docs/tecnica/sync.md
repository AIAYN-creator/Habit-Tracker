# Motor de sincronización

Implementa el algoritmo de `adr-sync`. Vive en `features/sync` y no lo llama nadie más que el
propio ciclo de vida de la app y el botón manual.

## Piezas

| Módulo | Responsabilidad |
|---|---|
| `client` | Llamadas a la API de GitHub, con el token de `auth-gh` |
| `differ` | Qué cambió en remoto desde el último commit visto |
| `merger` | La fusión a tres bandas de `adr-sync`, sin tocar red |
| `committer` | Blobs, árbol, commit y movimiento de la referencia |

El `merger` es una función pura: base, local y remoto entran, resultado y lista de conflictos
salen. Es la pieza con más riesgo de toda la app y la que más tests lleva, y siendo pura se puede
probar sin simular la red.

## El ciclo

1. **Comprobar la referencia.** `GET /repos/{owner}/{repo}/git/ref/heads/main` con la ETag
   guardada. Si responde 304, no hay nada nuevo: la sincronización sin cambios cuesta **una
   llamada que ni siquiera consume cuota**.
2. **Diferencia.** Si el SHA cambió, se pide el árbol recursivo y se comparan los SHA de blob con
   los guardados. Sólo se descargan los ficheros distintos.
3. **Fusión.** Para cada fichero cambiado en ambos lados, `merger` con la base de `syncBase`. Los
   descartes van al registro de conflictos.
4. **Escritura local**, en una transacción: entradas fusionadas, `syncBase` actualizada y las
   entradas resultantes encoladas si la fusión cambió algo local.
5. **Empuje.** Se vacía la `outbox`: un blob por fichero, un árbol, **un commit** y actualización
   de la referencia.
6. **Cierre.** Se guardan el SHA nuevo, la ETag y la marca de tiempo.

Si el paso 5 falla porque la referencia se movió, se vuelve al 1. Tres intentos; al cuarto se deja
en la cola y se avisa. Sin bucles infinitos contra la API de nadie.

## Un solo sincronizado a la vez

Un cerrojo en memoria. Abrir la app, tocar el botón manual y que se dispare el automático al
volver del segundo plano puede pasar en el mismo segundo, y tres ciclos concurrentes contra la
misma referencia es cómo se generan conflictos que no existían.

Si ya hay uno en marcha, el segundo no encola otro: devuelve el que está corriendo.

## Nunca bloquea

Se ejecuta en segundo plano y la app se usa igual mientras tanto. Si el usuario escribe una
entrada a mitad de sincronización, se encola con normalidad y entra en el ciclo siguiente; no se
congela ningún control ni se muestra un modal de espera.

## Qué se guarda al terminar

`syncState` con el SHA, la ETag y la fecha; `syncBase` con la versión sincronizada de cada
fichero tocado; y el registro de conflictos, que `estado-sync` enseña.

`syncBase` es la tabla que `adr-sync` dejó anotada como deuda de `dexie`. **Sin ella este motor no
se puede escribir**, así que la propuesta sobre `dexie` va antes que la implementación.

## Pruebas

- El `merger`, con los tres casos de `adr-sync`: días distintos, claves distintas del mismo día y
  la misma clave.
- El ciclo entero contra un cliente simulado: sin cambios, sólo remoto, sólo local, ambos,
  referencia movida a mitad y token caducado.
- Una prueba manual real contra `habit-tracker-data` antes de dar la tarjeta por cerrada. Un motor
  de sincronización que sólo ha visto simulacros no está probado.

## Criterios de aceptación

- [ ] Una sincronización sin cambios cuesta una llamada y no consume cuota.
- [ ] Una semana de cambios offline produce un único commit.
- [ ] Los tres casos de conflicto de `adr-sync` se comportan como allí se describe.
- [ ] Dos ciclos disparados a la vez no se solapan.
- [ ] Registrar una entrada durante una sincronización no bloquea ni se pierde.
- [ ] Verificado contra el repo real, con dos dispositivos.
