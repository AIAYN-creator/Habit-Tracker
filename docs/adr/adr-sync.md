---
description: Pull+merge+push con fusion a tres bandas por fichero de dia (base = ultima
  version sincronizada); LWW por timestamp solo en las claves que ambos dispositivos
  tocaron.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# ADR: sincronización y conflictos

**Estado:** propuesto, pendiente de firma
**Fecha:** 2026-08-26

## Contexto

Un solo usuario, varios dispositivos —móvil, PC, iPad—, un repo privado de GitHub como punto de
encuentro y ningún servidor propio. No hay tiempo real: cada dispositivo empuja y trae en momentos
concretos, y entre medias puede haber trabajado sin red.

La primera formulación de esto, en `vision`, decía "last-write-wins por timestamp". Esta ADR la
refina, porque el LWW a nivel de fichero pierde datos en un caso perfectamente cotidiano.

## Unidad de sincronización

El fichero. Es decir: un día completo (`entries/2026/2026-08-26.json`) o un schema entero
(`schemas/habits.json`). Ficheros distintos no colisionan jamás, y como cada día es un fichero,
la inmensa mayoría de las sincronizaciones no tienen nada que resolver.

## El problema del LWW puro

Registras "correr" en el móvil. Antes de que sincronice, marcas "leer" en el iPad. Ambos escriben
el fichero del mismo día. Con last-write-wins a nivel de fichero, gana el `updatedAt` más alto y
**el otro registro desaparece entero**, no sólo la clave en disputa.

No es un caso exótico: es lo que pasa al registrar algo desde el móvil por la mañana y completar
el día desde el ordenador por la noche.

## Decisión: fusión a tres bandas, LWW sólo en la colisión real

La app sabe qué versión de cada fichero descargó la última vez. Con esa **base** puede hacer lo
mismo que hace Git con el código:

```
base    = última versión sincronizada del fichero
local   = versión en este dispositivo
remoto  = versión en GitHub ahora
```

Para cada clave del objeto —cada hábito, cada dimensión de mood, la nota—:

| Situación | Resultado |
|---|---|
| Sólo cambió en local | Gana local |
| Sólo cambió en remoto | Gana remoto |
| Cambió en ambos, al mismo valor | Sin conflicto |
| Cambió en ambos, a valores distintos | **LWW por el `updatedAt` de la entrada** |

En el ejemplo de arriba, el móvil tocó `h_run` y el iPad tocó `h_read`: conjuntos disjuntos, se
quedan los dos. El LWW sólo entra en juego cuando ambos dispositivos tocaron *la misma clave*,
que sí es un caso raro.

### Nada se pierde en silencio

Cuando el LWW descarta un valor, la versión perdedora se guarda en un registro local de conflictos
con fecha, clave y ambos valores. `estado-sync` lo muestra si hay algo. Un dato sobrescrito sin
avisar es peor que un error visible.

### Los schemas se fusionan igual

`habits.json` y `moods.json` son listas con `id`. La fusión es por `id` en lugar de por clave, con
las mismas cuatro reglas. Añadir un hábito en el móvil y otro en el PC deja los dos.

## Lo que esto exige y aún no existe

Para tener la **base** hay que guardarla: la última versión sincronizada de cada fichero, en
local. Son unos 400 kB al año, irrelevante.

`dexie` define seis tablas y ninguna es esa. **Hace falta una séptima, `syncBase`**, y eso es un
cambio en una tarjeta ya aprobada, así que va por su propia propuesta sobre `dexie`. Queda
anotado como acción pendiente, no como supuesto.

La alternativa —descargar la base de GitHub por SHA en cada fusión— se descarta: convierte una
operación offline en una que necesita red justo cuando la red es el problema.

## Mecánica contra la API

**Traer:** se guarda el SHA del último commit visto. Se pide la referencia de `main`; si el SHA
coincide, no hay nada que hacer y la sincronización termina en una llamada. Si no, se compara el
árbol y se descargan sólo los ficheros cambiados.

**Empujar:** con la Git Data API —crear blobs, árbol, commit y mover la referencia—, no con la
Contents API. La razón es que la Contents API hace **un commit por fichero**, y `adr-repo` fijó un
commit por sincronización. Siete días acumulados sin red deben producir un commit, no siete.

**Si la referencia se movió mientras empujabas** (otro dispositivo se adelantó), se vuelve a
traer, se fusiona y se reintenta. Máximo tres intentos; a la cuarta, se deja en la cola y se avisa.

## Cuándo se sincroniza

Al abrir la app, al cerrarla o pasar a segundo plano, y con un botón manual. Nunca bloquea la
interfaz: se registra el día igual mientras sincroniza, falle o no.

Sin red, los cambios se acumulan en `outbox` y se envían al volver, con reintentos espaciados
—30 s, 2 min, 10 min— y sin insistir en bucle.

## Relojes

El LWW depende de `updatedAt`, que lo escribe cada dispositivo con su propio reloj. Un móvil con
la hora mal desplaza el resultado. No se corrige en v1 —requeriría un reloj lógico y complica el
modelo—, pero sí se detecta: si un `updatedAt` remoto está más de una hora en el futuro respecto
al reloj local, se anota en el registro de conflictos. Es barato y convierte un misterio en un
aviso.

## Errores

| Error | Respuesta |
|---|---|
| 401 / 403 por token | Aviso persistente en Ajustes; la app sigue funcionando en local |
| 403 por límite de peticiones | Espera hasta la ventana siguiente; no debería ocurrir nunca |
| 409 en la referencia | Traer, fusionar y reintentar, hasta tres veces |
| Red caída | A la cola, con reintentos espaciados |
| JSON remoto ilegible | No se toca ese fichero, se avisa y se sigue con el resto |

## Criterios de aceptación

- [ ] Dos dispositivos editando **días distintos** convergen sin conflicto.
- [ ] Dos dispositivos editando **claves distintas del mismo día** conservan ambos valores.
- [ ] Dos dispositivos editando **la misma clave** resuelven por LWW y dejan traza del descarte.
- [ ] Una semana de cambios offline produce **un solo commit** al recuperar la red.
- [ ] Una sincronización sin cambios cuesta una única llamada a la API.
- [ ] La app es plenamente usable con el token caducado.
