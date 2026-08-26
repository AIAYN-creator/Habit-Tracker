# Modelo de datos schema-driven

Este es el documento del que cuelga casi todo: persistencia local, serialización, sync y los dos
ADR. Las decisiones de aquí son caras de cambiar más tarde, así que van razonadas.

## Reglas transversales

1. **Los IDs son estables y nunca se reutilizan.** Un `id` es un slug corto generado al crear el
   hábito (`nanoid` de 8 caracteres o similar), no el nombre. Renombrar "Correr" a "Salir a
   correr" no debe tocar ni una entrada histórica.
2. **Nada se borra: se archiva.** Eliminar un hábito pondría entradas huérfanas en todo el
   historial. `archivedAt` lo saca de la UI de registro pero lo mantiene en las visualizaciones
   históricas.
3. **Toda escritura lleva `updatedAt` en UTC ISO-8601.** Es el insumo del last-write-wins de
   `adr-sync`; sin esto la sincronización no puede decidir nada.
4. **Los ficheros son legibles a mano.** JSON indentado con 2 espacios y claves ordenadas, para
   que el `diff` de GitHub sirva de algo y el repo de datos sea auditable sin la app.

## `schemas/habits.json`

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-26T18:04:11Z",
  "habits": [
    {
      "id": "h_run",
      "name": "Correr",
      "type": "duration",
      "config": { "unit": "min", "step": 5, "target": 30 },
      "display": { "chart": "bars" },
      "frequency": { "kind": "weekly", "times": 3 },
      "category": "salud",
      "color": "#e07a5f",
      "order": 1,
      "createdAt": "2026-08-26T18:04:11Z",
      "updatedAt": "2026-08-26T18:04:11Z",
      "archivedAt": null
    }
  ]
}
```

### Tipos de hábito

| `type` | Valor en la entrada | `config` | Visualización por defecto |
|---|---|---|---|
| `boolean` | `true` / `false` | — | heatmap |
| `counter` | entero ≥ 0 | `step`, `target`, `unit` | barras |
| `duration` | minutos, entero ≥ 0 | `step`, `target`, `unit` | barras |
| `scale` | entero dentro de `[min, max]` | `min`, `max`, `step`, `labels` | línea |

La última columna es el **valor por defecto**, no una imposición: se puede cambiar por métrica con
el bloque `display`.

`duration` se guarda **siempre en minutos**, aunque la UI muestre "1 h 30". Guardar unidades
mixtas es la vía rápida a datos incomparables entre sí.

### `display`

El contrato de customización de `charts` promete que el usuario elige cómo se visualiza cada
métrica. Ese ajuste vive en el schema, junto al hábito, y no en las preferencias globales: es una
propiedad de la métrica, y debe viajar con ella entre dispositivos.

```json
"display": { "chart": "bars", "input": "faces" }
```

- `input`: como se pide el valor al registrar. **Opcional**, y hoy sólo tiene un valor:
  `faces`, aplicable a dimensiones de ánimo de tipo `scale` con máximo 5, que se registran
  tocando una de cinco caras en vez de un número. Es una propiedad de la métrica y no una
  preferencia global —quien tenga dos escalas puede querer caras en el ánimo y números en las
  horas de sueño—, así que vive aquí y no en `panel-tema`. Si falta, se usa el control por
  defecto del tipo.
- `chart`: `heatmap`, `line` o `bars`. **Opcional**: si falta, se usa el valor por defecto de la
  tabla de arriba. Que sea opcional es lo que hace este cambio compatible hacia atrás, porque los
  ficheros ya escritos no lo llevan y no necesitan migrarse.
- No toda combinación tiene sentido, y la UI sólo ofrece las que sí: una escala no se dibuja como
  heatmap de intensidad porque un 3 sobre 5 no es "más intenso" que un 2, es distinto.

Las preferencias que valen para todas las gráficas a la vez —curva de la línea, rejilla visible,
radio de las celdas— **no** van aquí: son globales y viven en las preferencias de `panel-tema`.
La regla para decidir dónde va cada cosa es si tiene sentido responderla por métrica.

Las dimensiones de mood aceptan el mismo bloque, con las mismas reglas.

### Frecuencia

`frequency` describe la expectativa, no una obligación: alimenta el cálculo de adherencia y el
color atenuado de los días no esperados.

- `{ "kind": "daily" }`
- `{ "kind": "weekly", "times": 3 }` — tres veces por semana, sin fijar cuáles
- `{ "kind": "weekdays", "days": [1,2,3,4,5] }` — ISO, lunes = 1
- `{ "kind": "none" }` — se registra cuando toca, sin expectativa

## `schemas/moods.json`

Misma forma, con dimensiones en vez de hábitos:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-08-26T18:04:11Z",
  "dimensions": [
    {
      "id": "m_energy",
      "name": "Energía",
      "type": "scale",
      "config": { "min": 1, "max": 5, "labels": ["Agotado", "", "", "", "Pletórico"] },
      "color": "#3d5a80",
      "order": 1,
      "createdAt": "2026-08-26T18:04:11Z",
      "updatedAt": "2026-08-26T18:04:11Z",
      "archivedAt": null
    }
  ]
}
```

Tipos de dimensión: `scale` (1-5 u otro rango), `tags` (lista libre con `config.options` como
sugerencias, no como restricción) y `note` (texto libre).

El "multi-eje" del scope original no es un tipo aparte: son varias dimensiones `scale`
coexistiendo. Un eje de valencia y otro de activación son dos entradas en este array, y así la
UI puede pintarlas juntas o por separado sin que el modelo lo imponga.

## `entries/YYYY-MM-DD.json`

```json
{
  "date": "2026-08-26",
  "schemaVersion": 1,
  "habits": { "h_run": 35, "h_read": true },
  "moods": { "m_energy": 4, "m_tags": ["social", "productivo"] },
  "note": "Día raro pero bien.",
  "createdAt": "2026-08-26T21:40:02Z",
  "updatedAt": "2026-08-26T22:15:47Z"
}
```

- **Un fichero por día**, no un fichero por hábito y día. Es la unidad natural de edición y la
  que produce el `diff` más legible.
- **Sólo se guardan los valores registrados.** La ausencia de una clave significa "no
  registrado", que no es lo mismo que `false` o `0`. Esta distinción importa: un heatmap que
  pinta igual "no lo hice" y "no lo anoté" está mintiendo.
- Las claves referencian IDs de los schemas. Si un ID no existe en el schema actual (hábito
  archivado y luego purgado a mano en el repo), la app lo ignora al pintar, sin romperse.

## El día es local, no UTC

`date` es el día natural **en la zona del dispositivo**. Registrar a las 00:30 del martes cuenta
como martes, aunque en UTC sea lunes. Es lo que espera cualquiera que use la app, y hace que los
datos sean estables al viajar.

Sabiendo que esto choca con quien se acuesta tarde: se acepta para v1 y se anota como candidato a
ajuste (un "corte de día" configurable a las 04:00, por ejemplo) si el uso real lo pide.

## Versionado y evolución del schema

`schemaVersion` va tanto en los schemas como en cada entrada, y es un entero que sólo sube.

Qué se considera cambio compatible y qué no:

| Cambio | Compatible | Qué pasa con el histórico |
|---|---|---|
| Renombrar, recolorear, reordenar | Sí | Nada, el `id` no cambia |
| Cambiar o quitar `display` | Sí | Nada, sólo afecta a cómo se dibuja o se registra |
| Añadir un hábito | Sí | Los días previos quedan sin esa clave: "no registrado" |
| Archivar un hábito | Sí | Sigue visible en el histórico, fuera del registro diario |
| Ampliar el rango de una `scale` (1-5 → 1-10) | Sí | Los valores viejos siguen siendo válidos |
| Reducir el rango de una `scale` | **No** | Requiere migración explícita o queda fuera de rango |
| Cambiar el `type` de un hábito | **No** | Se resuelve archivando el viejo y creando uno nuevo |

La regla práctica: **cambiar el tipo de un hábito no está permitido**. La UI ofrecerá "archivar y
crear uno nuevo" en su lugar. Convertir un booleano en contador retroactivamente obliga a
inventarse datos que nunca se registraron, y prefiero perder esa comodidad que corromper el
histórico.

## Nota sobre el futuro multi-tenant

Ninguna de estas estructuras lleva un `userId`, y es deliberado: en v1 el propietario está
implícito en el repo. La migración a multi-tenant consiste en añadir esa columna al importar,
no en rehacer el modelo.

## Criterios de aceptación

- [ ] Tipos TypeScript derivados de este documento, con los cuatro `type` de hábito y los tres de
      dimensión.
- [ ] `display` es opcional y un fichero sin él se lee sin migración.
- [ ] `display.input` con valor `faces` sólo se ofrece en escalas de máximo 5.
- [ ] Un fichero de ejemplo válido por cada uno de los tres tipos de fichero.
- [ ] Queda documentado que ausencia de clave ≠ valor falso.
- [ ] La tabla de compatibilidad de cambios de schema es la referencia de `validacion`.
