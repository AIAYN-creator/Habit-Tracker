# Historial en lista

La otra cara del historial: los días en orden inverso, con lo registrado resumido. Responde "¿qué
hice el jueves?" mejor que un calendario, porque enseña contenido y no sólo densidad.

Conmutador compartido con `calendario`, y la elección se recuerda.

## Cada fila

```
mar 26 ago    ●●●○   Correr 35 min · Leer · Energía 4
              "Día raro pero bien."
```

Fecha, indicador compacto de completitud y un resumen en una línea con lo registrado. La nota, si
existe, en una segunda línea recortada. Es lo que convierte la lista en algo que se lee de un
tirón.

Los días sin registrar **no se listan**. Una lista donde nueve de cada diez filas dicen "sin
datos" es una lista inservible, y el hueco se percibe igual por el salto de fechas.

## Desplazamiento

Carga por páginas —un mes cada vez— al llegar al final, en lugar de todo el histórico de golpe.
Con separadores de mes fijos arriba mientras se recorre, para no perder la referencia temporal.

Al abrir, arranca por el día más reciente.

## Interacción

Tocar una fila abre `entrada` con esa fecha. Nada de editar en línea desde la lista: sería un
segundo camino de escritura hacia los mismos datos, con sus propios errores, para ahorrar un
toque.

## Búsqueda

Un campo para filtrar por texto de la nota y por hábito registrado. Es lo que hace útil un
historial de dos años, y es barato: las notas están en local y ocupan unos pocos kilobytes.

Sin resultados, se dice qué se buscó y se ofrece limpiar el filtro.

## Criterios de aceptación

- [ ] Cada fila resume lo registrado en una línea legible.
- [ ] Los días sin registrar no aparecen.
- [ ] La carga es por páginas y arranca por el día más reciente.
- [ ] Tocar una fila abre `entrada`, sin edición en línea.
- [ ] El filtro busca en notas y por hábito, con estado vacío propio.
- [ ] El conmutador con `calendario` recuerda la última vista usada.
