---
description: 'Organización de los JSON en el repo privado de GitHub: carpetas por
  año, naming y monorepo de datos.'
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# ADR: estructura del repo de datos

**Estado:** propuesto, pendiente de firma
**Fecha:** 2026-08-26
**Repo:** `AIAYN-creator/habit-tracker-data`, privado, actualmente vacío

## Contexto

El repo privado es la copia de seguridad y el canal de sincronización entre dispositivos. Sus dos
lectores son la app y, ocasionalmente, un humano mirando el `diff` en GitHub. La estructura tiene
que servir a ambos y sobrevivir diez años de uso diario sin volverse incómoda.

## Estructura

```
schemas/
  habits.json
  moods.json
entries/
  2026/
    2026-08-26.json
    2026-08-27.json
  2027/
meta.json
README.md
```

### Por qué carpetas por año

Un directorio plano acumula 365 ficheros al año: manejable el primer año, tedioso al quinto y
lento de listar por la API al décimo. Agrupar por año mantiene cada directorio en un tamaño que
la interfaz de GitHub muestra sin paginar y que la API devuelve en una sola llamada.

La alternativa de agrupar por mes daría 120 directorios en diez años para ahorrar un listado que
ya es barato. No compensa.

### Por qué un fichero por día

Ya se decidió en `modelo` y aquí sólo se confirma la consecuencia: el `diff` de un día es
legible, dos dispositivos que editan días distintos no colisionan nunca, y recuperar un día
concreto no obliga a descargar el año entero.

### `meta.json`

Metadatos del propio almacén: versión del formato, fecha de creación e identificadores de los
dispositivos que han sincronizado. **No contiene datos de hábitos.** Sirve para que la app detecte
que está hablando con un repo de una versión que no entiende, en lugar de escribir encima.

### `README.md`

Corto, escrito una vez a mano: qué es este repo, que lo genera una app, el formato de los
ficheros y cómo recuperar los datos sin la app. Es lo que agradecerá quien abra esto dentro de
cinco años, incluido su autor.

## Formato de escritura

Tres reglas, todas al servicio de que el `diff` sea legible:

1. JSON indentado con dos espacios.
2. **Claves ordenadas alfabéticamente.** Sin esto, dos dispositivos con motores de JavaScript
   distintos pueden serializar el mismo objeto en distinto orden y producir un `diff` enorme para
   un cambio de un valor.
3. Salto de línea final, para que Git no marque "no newline at end of file" en cada fichero.

## Estrategia de commits

**Un commit por sincronización, no uno por entrada.** Un día típico produce uno o dos commits; un
sincronizado tras una semana sin red produce uno con siete ficheros.

Mensajes generados por la app, descriptivos y estables:

```
sync: entrada del 2026-08-26
sync: 7 entradas (2026-08-20..2026-08-26)
sync: schema de hábitos actualizado
```

Sólo rama `main`. Sin ramas, sin pull requests, sin tags: es un almacén de datos, no un proyecto.

## Volumen

Alrededor de 1 kB por día. Unos 400 kB al año contando el historial de Git, y del orden de 4 MB
en diez años. Irrelevante frente a cualquier límite de GitHub. No hay que planificar poda ni
archivado.

## Lo que hay que saber antes de firmar

**Borrar una entrada no la borra del historial de Git.** Si un día registras algo que preferirías
no haber escrito y lo eliminas desde la app, el fichero desaparece del árbol actual pero sigue
recuperable en el historial. Es cómo funciona Git, no un fallo.

Las opciones honestas son tres, y hay que elegir una en lugar de descubrirlo más tarde:

1. **Asumirlo** — es un repo privado de un solo usuario, y el historial es también la red de
   seguridad ante un borrado accidental. *Recomendada para v1.*
2. Reescribir el historial al borrar. Frágil, lento y rompe la sincronización de cualquier otro
   dispositivo.
3. Cifrar el contenido de los ficheros en el cliente. Elimina el `diff` legible y el acceso sin
   la app, que son dos de las razones de esta arquitectura.

Se propone la primera, dicho explícitamente en el README del repo de datos para que quede
constancia.

## Consecuencias

- `serialize` implementa las tres reglas de formato y las prueba con ida y vuelta.
- `sync` agrupa cambios en un commit por sincronización y compone los mensajes de arriba.
- La ruta de un día se calcula como `entries/${año}/${fecha}.json`, sin excepciones.
- Restaurar en un dispositivo nuevo es clonar el repo y leerlo entero: sin proceso de importación
  aparte.

## Criterios de aceptación

- [ ] El repo de datos tiene la estructura de arriba, con `meta.json` y `README.md` escritos.
- [ ] Un fichero de entrada de ejemplo, válido según `modelo`, commiteado a mano.
- [ ] Modificar un valor de un día produce un `diff` de una sola línea.
- [ ] La decisión sobre el historial de borrados está escrita en el README del repo de datos.
