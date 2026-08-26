# Series para escalas

Línea temporal para las dimensiones de tipo `scale`: energía, ánimo, sueño. Se construye sobre la
capa compartida que extrae `heatmap`.

## El eje Y es el de la escala, no el de los datos

Una escala del 1 al 5 se dibuja **del 1 al 5**, aunque tus valores estén todos entre 3 y 4.

Ajustar el eje al rango de los datos es lo que hacen casi todas las librerías por defecto, y
convierte una variación de medio punto en una montaña rusa. En una app de estado de ánimo eso no
es un detalle estético: es hacer que alguien crea que su semana ha sido un desastre porque el eje
se autoescaló.

## Los huecos son huecos

Un día sin registrar **rompe la línea**. No se interpola, no se arrastra el último valor, no se
asume cero.

Interpolar sería inventar datos sobre el estado de ánimo de alguien un día que no lo anotó. La
línea se corta y se retoma, y si el hueco es de un solo día, se une con un trazo punteado para que
la forma general siga leyéndose.

## Curva

`curveMonotoneX`, no `curveBasis` ni `curveCardinal`. Las curvas suaves clásicas **sobrepasan** los
puntos: con valores 4, 5, 4 dibujan un pico por encima de 5, que en una escala de 1 a 5 es un
valor que no existe. La monótona pasa por los puntos sin inventarse máximos.

Que la línea sea "suave o escalonada" es una preferencia del contrato de `charts`; ambas variantes
cumplen esta regla.

## Varias dimensiones a la vez

El caso del multi-eje de `moods`: dos escalas superpuestas en la misma gráfica, cada una con su
color, con leyenda. Requisito: sólo se pueden superponer escalas **con el mismo rango**; mezclar
un 1-5 con un 1-10 en un eje compartido es engañoso, y la UI no lo ofrece.

## Rango temporal

Treinta días, noventa días o el año, con el mismo selector que el resto de gráficas. Por encima de
noventa días se muestra además la media móvil de siete días, atenuada: con un año de puntos
diarios la línea cruda es ruido.

## Interacción

Al pasar el ratón o arrastrar el dedo, una guía vertical con el valor del día y la fecha. En
móvil, el arrastre sobre la gráfica recorre los días sin necesidad de apuntar a un punto de 4 px.

## Accesibilidad

`role="img"` con un resumen —rango, media y tendencia— y la tabla oculta con fecha y valor.

## Criterios de aceptación

- [ ] El eje Y es el rango declarado de la escala, no el de los datos.
- [ ] Un día sin registrar rompe la línea y no se interpola. Con test.
- [ ] La curva no sobrepasa el máximo de la escala con datos en el extremo.
- [ ] Dos escalas del mismo rango se superponen con leyenda; de rangos distintos, no se ofrece.
- [ ] A más de noventa días aparece la media móvil de siete.
- [ ] El recorrido con el dedo funciona sin apuntar a un punto concreto.
