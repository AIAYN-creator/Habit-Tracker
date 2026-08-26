# Historial en calendario

Un mes a la vez, con el estado de cada día de un vistazo. Es la vista para responder "¿cómo llevo
el mes?", no para analizar: eso es de las gráficas.

## Qué se ve en cada día

El problema de diseño es que un día tiene varios hábitos y una celda de calendario mide 40 px. Se
descarta meter una miniatura por hábito: a esa escala son puntos indistinguibles.

En su lugar, **un indicador de completitud**: un anillo o una barra bajo el número que representa
la proporción de lo esperado ese día que se registró. Se apoya en la `frequency` de `modelo`, que
existe precisamente para saber qué se esperaba.

Con los mismos estados que en el resto de la app, y la misma distinción de siempre:

| Estado | Aspecto |
|---|---|
| Nada esperado ese día | Número normal, sin indicador |
| Esperado y completo | Indicador lleno con el color de acento |
| Esperado y parcial | Indicador proporcional |
| Esperado y sin registrar | Contorno tenue, no vacío |
| Hoy | Marcado aparte, siempre visible |
| Futuro | Atenuado, no tocable |

## Navegación

Mes anterior y siguiente con flechas y con deslizamiento lateral, más un botón para volver al mes
actual cuando no estás en él.

No se navega más allá del mes en curso, ni hacia atrás más allá del primer día con datos. Un
calendario infinito hacia 1970 es una forma de perderse.

## Interacción

Tocar un día abre la pantalla de `entrada` con esa fecha. La misma pantalla que el registro
diario, sin modo de sólo lectura, como fijó `flujos`.

## Semana y localización

Empieza en lunes. Los nombres de día y mes salen de `Intl`, no de un array escrito a mano: es
gratis y evita el clásico de tener la app en español con los meses en inglés.

## Rendimiento

Una consulta por rango de mes con `useLiveQuery`, no una por día. Al cambiar de mes se consulta el
nuevo; los meses ya vistos no se cachean a mano, que para eso está Dexie.

## Accesibilidad

Retícula con roles de tabla y encabezados de día de la semana. Navegación con flechas entre días,
`Inicio` y `Fin` para principio y fin de semana. Cada celda anuncia la fecha completa y el estado,
no sólo el número: "26 de agosto, 3 de 4 registrados".

## Criterios de aceptación

- [ ] El indicador refleja la proporción de lo esperado según `frequency`.
- [ ] Un día sin registrar se distingue de uno sin nada esperado.
- [ ] Tocar un día abre la pantalla de `entrada`, no un componente distinto.
- [ ] No se navega al futuro ni antes del primer dato.
- [ ] La semana empieza en lunes y los nombres vienen de `Intl`.
- [ ] Cada celda anuncia fecha y estado a un lector de pantalla.
