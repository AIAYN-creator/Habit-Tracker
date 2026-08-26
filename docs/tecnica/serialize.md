# Serialización de datos

Conversión entre el modelo local y los ficheros del repo. Es la pieza que decide si el `diff` de
GitHub es legible y si la sincronización conserva los datos.

## Contrato

```ts
serializeEntry(entry): string        // JSON listo para commitear
parseEntry(raw, path): Entry         // valida y migra, ver validacion
pathForDate(date): string            // entries/2026/2026-08-26.json
```

Con una propiedad que se prueba y no se supone: `parse(serialize(x))` es igual a `x`, para
cualquier entrada válida, incluidas las que llevan claves desconocidas.

## Las tres reglas de formato

Vienen de `adr-repo` y se implementan aquí:

1. Indentación de dos espacios.
2. **Claves ordenadas alfabéticamente**, de forma recursiva. Sin esto, dos motores de JavaScript
   pueden emitir el mismo objeto en distinto orden y producir un `diff` completo por un cambio de
   un valor.
3. Salto de línea final.

`JSON.stringify` no ordena claves por sí solo: hay que construir el objeto ordenado o usar la
función `replacer`. Es la clase de detalle que se olvida y sólo se nota meses después, cuando
todos los diffs son ilegibles.

## El escollo del base64

La API de GitHub recibe el contenido de los ficheros **en base64**. Y `btoa()` falla con cualquier
carácter fuera de Latin-1: una nota con "ñ", un hábito llamado "Meditación" o un emoji revientan
la llamada.

La conversión correcta pasa por UTF-8 explícito:

```ts
const bytes = new TextEncoder().encode(json);
const base64 = btoa(String.fromCharCode(...bytes));
```

Y a la inversa con `TextDecoder` al leer. Con un texto en español esto no es un caso raro: es el
primer hábito que alguien escriba con tilde.

Para ficheros grandes, `String.fromCharCode(...bytes)` desborda la pila con arrays de decenas de
miles de elementos. Nuestros ficheros son de 1 kB, así que no aplica hoy; queda anotado por si
algún día se serializa un año entero de golpe.

## Qué se serializa

- Una entrada por fichero, con la forma de `modelo`.
- Los dos schemas completos, cada uno en su fichero.
- Las preferencias de tema sincronizables, cuando exista el `settings.json` que `panel-tema` dejó
  anotado como deuda de `adr-repo`.

Las claves desconocidas se conservan tal cual, ordenadas junto al resto. Es lo que hace posible
que un dispositivo con una versión antigua no borre lo que escribió uno con versión nueva.

## Lo que no se serializa

`outbox`, `syncState`, `syncBase` y la densidad de la interfaz. Son estado local del dispositivo;
subirlos al repo sería sincronizar el mecanismo de sincronización.

## Criterios de aceptación

- [ ] `parse(serialize(x)) === x` para entradas con todos los tipos de dato, con test.
- [ ] Una clave desconocida sobrevive a la ida y vuelta.
- [ ] Dos serializaciones del mismo objeto producen bytes idénticos.
- [ ] Un texto con tildes y emoji se codifica y descodifica correctamente. Con test.
- [ ] Cambiar un valor de un día produce un `diff` de una sola línea.
- [ ] La ruta de un día es siempre `entries/<año>/<fecha>.json`.
