# Heatmap de booleanos

La visualización insignia. Va primera de las tres y **paga la capa compartida** que `charts`
declaró necesaria: contenedor responsive, tooltip, estado vacío y la tabla oculta de
accesibilidad.

## Forma

Retícula de semanas en columnas y días de la semana en filas, como las contribuciones de GitHub:
las etiquetas de mes arriba, las de día a la izquierda, y la semana empezando en lunes por ser lo
esperado en España.

## Tres estados por celda, no dos

Aquí es donde se hace visible la distinción que `modelo` protege en los datos:

| Estado | Aspecto |
|---|---|
| Hecho | Relleno con el color del hábito |
| Registrado como no hecho | Celda con borde, sin relleno |
| Sin registrar | Celda vacía, apenas un fondo tenue |
| No esperado ese día, según `frequency` | Como sin registrar, pero más atenuada aún |

Un heatmap que pinta igual "no lo hice" y "no lo anoté" cuenta una historia falsa sobre tu año.
Es el motivo por el que esta tarjeta insiste tanto en ello.

## Intensidad, cuando no es booleano

El contrato de `charts` permite elegir heatmap para un contador. En ese caso la celda modula el
relleno con `--intensity` entre 0 y 1, y el degradado sale de `color-mix()` sobre el color del
hábito, sin escalas de color codificadas por hábito.

La escala de intensidad se calcula por **cuantiles del propio histórico**, no linealmente sobre el
máximo: un único día de 50 flexiones no debe dejar todo el resto del año en un tono plano.

## Responsive

Un año completo son 53 columnas, que no caben en un móvil sin encoger las celdas a un tamaño
inservible. La solución no es reducir el año: es **desplazamiento horizontal** con el presente a
la derecha y la vista abierta ya al final, más ajuste por meses al soltar.

El tamaño de celda sale de la densidad de `tokens`, con un mínimo de 10 px para que siga siendo
tocable.

## Interacción

Tocar una celda abre el día en el historial. Mantener pulsado —o pasar el ratón, en escritorio—
muestra el tooltip con la fecha y el valor. No hay más: es un mapa para mirar, no un formulario.

## Accesibilidad

`role="img"` con un `aria-label` que resuma el periodo y el porcentaje de cumplimiento, y una
tabla visualmente oculta con una fila por semana. Trescientas sesenta y cinco celdas enfocables
serían una trampa para la navegación por teclado, así que la ruta accesible es la tabla, no la
retícula.

## Rendimiento

365 rectángulos en SVG no son un problema; no hace falta canvas. Lo que sí hay que evitar es
recalcular la escala en cada repintado: se memoriza por rango y por hábito.

## Criterios de aceptación

- [ ] Los cuatro estados de celda se distinguen a simple vista en tema claro y oscuro.
- [ ] Un año de datos se desplaza con fluidez y abre por el presente.
- [ ] Cambiar el color del hábito repinta la retícula sin re-render de React.
- [ ] La escala de intensidad por cuantiles no se aplana con un valor atípico.
- [ ] Existe la tabla oculta equivalente y el `aria-label` resume el periodo.
- [ ] La capa compartida queda extraída y la usan `series` y `barras` sin duplicar nada.
