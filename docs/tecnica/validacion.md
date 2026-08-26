# Validación de schema

Dos trabajos distintos que conviene no mezclar: **validar** lo que entra de fuera y **decidir** si
un cambio de schema es aplicable sin romper el histórico.

## Dónde se valida

Con zod, y sólo en las fronteras:

| Frontera | Qué se valida |
|---|---|
| Lectura del repo de GitHub | Todo: schemas y entradas, antes de tocar la base local |
| Importación manual de un fichero | Todo |
| Formularios de la UI | El borrador antes de escribir |

**No** se valida en cada lectura de IndexedDB. Lo que ya está en la base local pasó por una de
esas puertas; revalidar en cada consulta es coste por nada, y con `useLiveQuery` esas consultas
son constantes.

Los tipos de TypeScript se derivan de los esquemas de zod con `z.infer`, no se escriben dos veces.
Un tipo y un validador que se mantienen a mano acaban discrepando.

## La regla que protege el multi-dispositivo: no borrar lo desconocido

Si el móvil tiene una versión nueva de la app que escribe un campo que el iPad todavía no conoce,
el iPad **no debe eliminar ese campo** al reescribir el fichero. Con la configuración por defecto,
zod descarta lo que no está en el esquema, y el resultado sería que el dispositivo más viejo borra
en silencio el trabajo del más nuevo cada vez que sincroniza.

Por tanto: `passthrough()` en los objetos que viajan al repo, y las claves desconocidas se
conservan y se vuelven a escribir tal cual. Es una línea de código y evita una clase entera de
pérdida de datos.

## Aplicabilidad de un cambio de schema

La tabla de `modelo` traducida a una función que la UI consulta **antes** de dejar guardar:

```ts
canApplySchemaChange(before, after): 'ok' | { blocked: string; suggestion: string }
```

| Cambio | Resultado |
|---|---|
| Renombrar, recolorear, reordenar | `ok` |
| Añadir hábito o dimensión | `ok` |
| Archivar | `ok` |
| Ampliar el rango de una escala | `ok` |
| Reducir el rango de una escala | Bloqueado si hay valores fuera del rango nuevo |
| Cambiar el tipo | Bloqueado siempre, con sugerencia de archivar y crear |

Que reducir el rango dependa de los datos y no sólo del schema es deliberado: si nunca puntuaste
por encima de 5, pasar de 1-10 a 1-5 es inofensivo y no hay razón para prohibirlo. La función
consulta el histórico y responde con el número de entradas afectadas, que es lo que la UI enseña.

## Migración por `schemaVersion`

Las migraciones son funciones puras `v(n) -> v(n+1)`, encadenadas, aplicadas **al leer**. Nunca se
reescribe el repo entero para migrar: cada fichero se migra cuando se lee y se guarda ya migrado
la próxima vez que cambie. Un repo con diez años de entradas no necesita una reescritura masiva
que además produciría un commit de miles de ficheros.

Si aparece un `schemaVersion` **mayor** que el que la app conoce, no se intenta adivinar: ese
fichero se deja intacto, se muestra un aviso de que hay que actualizar la app y se sigue con el
resto. Es el caso de un dispositivo desactualizado, y sobrescribir sería lo peor posible.

## Errores legibles

Los mensajes de zod se traducen antes de mostrarse. "Invalid input: expected number, received
string en habits.h_run" no es un mensaje para una persona; "El valor de Correr debería ser un
número" sí.

## Criterios de aceptación

- [ ] Los tipos del modelo se derivan de los esquemas de zod, sin duplicar definiciones.
- [ ] Un fichero con una clave desconocida sobrevive a una ida y vuelta sin perderla. Con test.
- [ ] `canApplySchemaChange` cubre las seis filas de la tabla, con tests.
- [ ] Reducir un rango se permite si no hay datos afectados y se bloquea si los hay.
- [ ] Un `schemaVersion` futuro no rompe la app ni se sobrescribe.
- [ ] Ningún error de zod llega a la interfaz sin traducir.
