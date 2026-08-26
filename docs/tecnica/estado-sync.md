# UI de estado de sincronización

Todo lo que el motor de `sync` hace por debajo tiene que ser legible sin abrir la consola. Esta
tarjeta define qué se enseña, dónde y con cuánta insistencia.

## Principio

**El registro diario nunca se interrumpe por la sincronización.** Ni un modal, ni un bloqueo, ni
un diálogo de error mientras alguien marca sus hábitos. La sincronización es una capa añadida,
como dice `vision`, y su interfaz tiene que comportarse como tal.

Lo que significa en la práctica: un indicador discreto en la cabecera y el detalle en Ajustes.
Nada más.

## Indicador en la cabecera

Un icono pequeño, con cuatro estados y sin texto:

| Estado | Aspecto |
|---|---|
| Al día | Sin icono. El caso normal no merece píxeles |
| Pendiente o sincronizando | Icono atenuado, con giro suave mientras dura |
| Sin conexión | Icono de desconexión, atenuado |
| Requiere atención | Icono con el color de aviso |

Sólo el último llama la atención, y sólo se usa para lo que **necesita que el usuario actúe**:
token caducado, permiso perdido, repo inaccesible. Un fallo de red pasajero no es eso.

Tocarlo lleva al detalle.

## Detalle en Ajustes

- Última sincronización, en lenguaje natural: "hace 3 minutos".
- Cuántos cambios hay pendientes de enviar, si los hay.
- Botón **Sincronizar ahora**, con su resultado en línea.
- Estado del token, con su caducidad si se conoce.
- Registro de conflictos, si hay algo.

## El registro de conflictos

Es la parte con contenido de verdad. Cuando `adr-sync` descarta un valor por last-write-wins,
queda anotado, y aquí se puede ver:

> **26 de agosto — Correr**
> Este dispositivo: 35 min · Otro dispositivo: 40 min
> Se conservó 40 min, escrito más tarde.
> [ Usar 35 min ]

Con la acción para revertir la decisión, que es lo que convierte un registro en algo útil en lugar
de en un diario de lamentos. Recuperar un valor descartado es escribirlo de nuevo con la fecha
actual, y sigue el camino normal.

Sin conflictos, esta sección no existe. No hay "0 conflictos": una lista vacía que hay que leer
para saber que no hay nada es peor que su ausencia.

## Errores, en el idioma del usuario

Cada fallo del motor tiene su frase y su salida:

| Fallo | Qué se dice | Qué se ofrece |
|---|---|---|
| Token caducado | "El acceso a GitHub ha caducado" | Renovar el token |
| Permiso insuficiente | "El token ya no puede escribir en el repositorio" | Revisar permisos, con enlace |
| Sin red | "Sin conexión. Los cambios se enviarán al volver" | Nada, es informativo |
| Conflicto de referencia | No se muestra | Se reintenta solo |
| JSON remoto ilegible | "Un fichero del repositorio no se entiende" | Cuál, y que se ha dejado intacto |

Ningún código HTTP a la vista. Un 409 no significa nada para quien registra hábitos.

## Criterios de aceptación

- [ ] En el estado normal no hay ningún indicador en la cabecera.
- [ ] Ningún estado de sincronización bloquea el registro diario.
- [ ] Sólo lo que exige acción del usuario usa el color de aviso.
- [ ] El registro de conflictos muestra ambos valores y permite recuperar el descartado.
- [ ] Sin conflictos, la sección no aparece.
- [ ] Ningún mensaje de error contiene un código HTTP ni jerga de la API.
