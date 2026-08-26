# Dashboard configurable (v1.5)

Componer la pantalla de gráficas con las piezas que cada uno quiera, en el orden que quiera. Es la
culminación del diferenciador de `vision`: hasta aquí el usuario personaliza cómo se ve la app;
esto le deja decidir **qué ve**.

Va después de v1 y no dentro, porque componer un tablero con piezas que todavía cambian de forma
es trabajo que se tira.

## La verdad incómoda sobre el drag & drop en móvil

La referencia mental es Notion: una retícula libre donde arrastras widgets a cualquier hueco. Eso
funciona en una pantalla ancha. En un móvil de 390 px **no hay retícula posible**: sólo cabe una
columna, y "arrastrar y soltar" se reduce a reordenar una lista.

Así que no es una interfaz, son dos comportamientos del mismo modelo:

| Pantalla | Qué se puede hacer |
|---|---|
| Móvil, una columna | Reordenar verticalmente, mostrar u ocultar, elegir alto |
| Escritorio, retícula de 12 columnas | Además, ancho y posición libres |

El modelo de datos es el mismo y guarda una disposición **por tamaño de pantalla**. Forzar la
retícula de escritorio en el móvil produciría widgets de 40 px de ancho, y forzar la lista del
móvil en el escritorio desperdiciaría dos tercios de la pantalla.

## Widgets disponibles

Los que ya existen tras v1, no piezas nuevas:

- Heatmap de un hábito
- Serie de una dimensión, o de varias del mismo rango
- Barras de un contador o duración
- Resumen de hoy
- Estado de sincronización

Cada widget es una instancia con su configuración —qué métrica, qué rango— así que se puede tener
el heatmap de dos hábitos distintos a la vez. Es el caso de uso que justifica todo esto.

## Persistencia

En `settings`, y **se sincroniza**, con el mismo criterio que `panel-tema`: la disposición es una
preferencia del usuario, no del dispositivo. Guardada por tamaño de pantalla, así que el móvil y
el escritorio pueden diferir sin pisarse.

Requiere una clave nueva en el `settings.json` de `adr-repo`, que ya existe y está pensado para
esto.

## Librería

**`dnd-kit`**, no `react-grid-layout`. Dos razones: soporte táctil de verdad, que es donde la
segunda flojea; y navegación por teclado incorporada, que en una retícula arrastrable es la
diferencia entre accesible e inaccesible.

La retícula de escritorio se implementa con CSS Grid propio y `dnd-kit` sólo para el gesto. Otra
vez el patrón de `charts`: primitivas de terceros, composición propia.

## Modo edición explícito

A diferencia del resto de la app, aquí **sí** hay un modo de edición con su botón. Un tablero
donde los widgets se mueven al rozarlos es un tablero que se descoloca solo cada vez que haces
scroll con el pulgar.

Fuera del modo edición, el tablero es una pantalla normal. Dentro, aparecen asas, el botón de
ocultar y el de añadir widget.

## Accesibilidad

Reordenar con teclado: seleccionar un widget, moverlo con las flechas, confirmar con Enter. Con
anuncios de posición al lector de pantalla —"Heatmap de Correr, posición 2 de 5"—, que es lo que
`dnd-kit` da hecho y por lo que se elige.

## Lo que no entra ni en v1.5

Widgets de terceros, fórmulas propias, tableros múltiples y compartir una disposición con otra
persona. Cada uno es un producto distinto.

## Criterios de aceptación

- [ ] Añadir, quitar y reordenar widgets, con la disposición persistida.
- [ ] Móvil en una columna y escritorio en retícula, con disposiciones independientes.
- [ ] Dos widgets del mismo tipo con métricas distintas conviven.
- [ ] La disposición viaja entre dispositivos sin que el móvil pise la del escritorio.
- [ ] Fuera del modo edición nada se mueve al desplazarse con el dedo.
- [ ] El tablero se reordena entero con teclado, con anuncios de posición.
