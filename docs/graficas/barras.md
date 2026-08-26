# Barras para contadores y duraciones

La gráfica de los hábitos que se miden en cantidad: vasos de agua, minutos de ejercicio, páginas
leídas. Sobre la capa compartida de `heatmap`.

## Agrupación automática

Un año en barras diarias son 365 barras de dos píxeles: ilegible. El intervalo de agrupación se
elige según el rango visible, sin pedírselo al usuario:

| Rango         | Una barra por |
| ------------- | ------------- |
| Hasta 31 días | Día           |
| Hasta 6 meses | Semana        |
| Más           | Mes           |

Y se dice en la gráfica cuál está activa: "por semana" bajo el título. Una gráfica que cambia de
unidad en silencio al deslizar es una gráfica que se malinterpreta.

## Suma o media

Al agrupar hay que decidir qué representa la barra, y la respuesta depende del hábito:

- **Contadores y duraciones: suma.** Los minutos corridos en una semana son la suma de sus días.
- Con el añadido de que las semanas incompletas —la actual— se marcan con un patrón distinto, para
  que no parezca que esta semana ha sido peor cuando lo que pasa es que aún no ha terminado.

La media queda como preferencia futura; en v1 la suma es lo que espera todo el mundo.

## Objetivo

Si el hábito tiene `target` en su configuración, una línea horizontal discontinua a esa altura,
escalada al intervalo: un objetivo diario de 30 minutos se dibuja a 210 en la vista semanal.

Las barras que llegan al objetivo usan el color pleno del hábito; las que no, el mismo color
atenuado con `color-mix()`. Sin verdes ni rojos: cumplir o no cumplir un hábito no es aprobar o
suspender, y el color emocional en una app de seguimiento personal envejece mal.

## Cero y sin registrar

Un día registrado a cero es una barra de altura mínima visible —una línea sobre el eje—, y un día
sin registrar no dibuja nada. Otra vez la misma distinción de `modelo`, y otra vez conviene que se
vea.

## Formato del eje

Las duraciones se etiquetan en horas y minutos, no en minutos crudos: "2 h" es legible, "120" no
dice de qué. Los contadores llevan su unidad si está configurada.

## Criterios de aceptación

- [ ] La agrupación cambia con el rango y se indica en la gráfica.
- [ ] Las barras suman dentro del intervalo, y el periodo incompleto se distingue.
- [ ] La línea de objetivo se escala al intervalo activo.
- [ ] Un día a cero se distingue de un día sin registrar.
- [ ] El eje de duraciones se etiqueta en horas y minutos.
- [ ] Ningún color codifica juicio: sólo el del hábito, pleno o atenuado.
