# CRUD de dimensiones de mood

Mismo patrón que `habitos`, en Ajustes → Estado de ánimo, con las diferencias propias de lo que
se está modelando.

## Tipos de dimensión

| Tipo | Configuración | Ejemplo |
|---|---|---|
| `scale` | mínimo, máximo, etiquetas de los extremos | Energía, de "Agotado" a "Pletórico" |
| `tags` | lista de sugerencias | Social, productivo, ansioso |
| `note` | ninguna | Texto libre del día |

### Las etiquetas de los extremos importan

Una escala del 1 al 5 sin etiquetas obliga a recordar qué significaba el 4, y a los tres meses
cada uno puntúa distinto que al principio. Poner nombre al mínimo y al máximo cuesta diez
segundos al crear y mantiene los datos comparables consigo mismos. El formulario los pide, aunque
no sean obligatorios.

### Las sugerencias de `tags` no son una restricción

La lista configurada aparece como accesos rápidos, y siempre se puede escribir uno nuevo sobre la
marcha. Un vocabulario cerrado obliga a decidir hoy cómo te vas a sentir dentro de un año.

Los tags escritos al vuelo se ofrecen después como sugerencia: el vocabulario se forma por uso, no
por configuración previa.

## El multi-eje no es un tipo

Modelar valencia y activación por separado son **dos dimensiones `scale`**, no una dimensión
especial. Así lo decidió `modelo`, y la consecuencia aquí es que la UI no tiene un tipo
"multi-eje": tiene una nota, al crear la segunda escala, ofreciendo mostrarlas juntas en las
gráficas.

## Cuántas dimensiones

Sin límite duro, pero con un aviso a partir de la cuarta: el registro diario tiene que caber en
treinta segundos, y cada dimensión de ánimo es una decisión consciente, no un toque mecánico como
un booleano. Es un consejo, no una prohibición; quien quiera seis, tendrá seis.

## Lo que se hereda de `habitos`

Lista reordenable, archivado en lugar de borrado cuando hay datos, tipo inmutable con la misma
salida de archivar y crear, color por dimensión y la misma validación de rangos. No se repite
aquí para que no haya dos versiones que puedan divergir.

## Criterios de aceptación

- [ ] Crear dimensiones de los tres tipos, con su configuración.
- [ ] Las etiquetas de los extremos se piden al crear una escala y se ven al registrar.
- [ ] Un tag nuevo escrito al vuelo se guarda y aparece luego como sugerencia.
- [ ] Dos escalas pueden marcarse para verse juntas en las gráficas.
- [ ] A partir de la cuarta dimensión aparece el aviso, sin bloquear.
- [ ] El tipo es inmutable y ofrece la misma alternativa que en `habitos`.
