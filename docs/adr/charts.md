---
description: Decidir entre D3/visx (control visual) y Recharts (velocidad de desarrollo).
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# ADR: librería de gráficas

**Estado:** propuesto (segunda versión), pendiente de firma
**Fecha:** 2026-08-26

## Contexto

Las visualizaciones de v1 son tres: heatmap tipo contributions para booleanos, línea suave para
escalas y barras para contadores y duraciones. Son, según `vision`, el epicentro del producto:
lo que distingue esto de una hoja de cálculo.

Esta ADR responde dos preguntas, no una. La primera es qué librería. La segunda, que la primera
versión de esta tarjeta se dejó fuera y es la que de verdad importa: **qué puede tocar el usuario
en una gráfica**. Sin esa segunda respuesta, "las gráficas son customizables" es una intención,
no una especificación.

## La pregunta mal planteada

"¿Qué estética trae la librería y pega con la nuestra?" no aplica igual a las tres candidatas:

- **visx no trae estética.** No es una librería de gráficas, es una caja de piezas matemáticas
  —escalas, generadores de path, cálculo de ejes— que devuelven SVG desnudo. Un `Bar` de visx es
  un `<rect>` sin color, sin radio y sin fuente. Todo lo que se ve lo pones tú.
- **Recharts sí trae estética**: rejilla gris, tooltip con su caja y su sombra, tipografía y
  curvas de animación propias. Se ajusta por props hasta cierto punto; por debajo de ese punto,
  reimplementas el componente.
- **D3 puro** tampoco trae estética, pero manipula el DOM por fuera de React, con el coste de
  refs, efectos y sincronización manual que eso implica.

Con `tokens` ya aprobado, la consecuencia es directa: las variables CSS llegan al 100% de una
gráfica sólo si esa gráfica es SVG propio. En Recharts, partes del tooltip y de la leyenda son
DOM suyo con estilos suyos, y ahí el theming llega a medias.

## Decisión: visx, usado en dos niveles

No se elige un nivel de abstracción único: se usan los dos, según lo que pida cada pieza.

**Nivel alto**, donde las primitivas son neutras y no condicionan el diseño: escalas
(`@visx/scale`), ejes (`@visx/axis`), `LinePath` y `Bar` (`@visx/shape`), utilidades de rejilla y
grupo.

**Nivel bajo**, SVG crudo con las escalas de visx por debajo, donde el diseño manda: las celdas
del heatmap, los tooltips, las anotaciones y cualquier micro-detalle de forma.

No hay costura entre ambos porque son el mismo SVG, el mismo sistema de escalas y el mismo
sistema de color. Esto es lo que hace innecesario mezclar librerías.

## Por qué no mezclar librerías

La opción intuitiva —Recharts para línea y barras, heatmap a mano— es la peor de las tres:

1. **Recharts no tiene heatmap.** La retícula tipo contributions hay que dibujarla como SVG
   propio en cualquier escenario, así que el ahorro sólo cubre dos de las tres gráficas.
2. Quedan dos estéticas conviviendo, y la costura se ve justo en la pantalla que más se mira.
3. Dos modelos de theming: variables CSS en una mitad, props de Recharts en la otra. `panel-tema`
   tendría que hablar dos idiomas.
4. Peso extra en el bundle de una librería que sólo participa en parte de la app.

## Contrato de customización

Esto es lo que significa "las gráficas son customizables". Todo lo de esta tabla debe funcionar
en v1; lo que no está, no es customizable en v1, y eso es una decisión, no un olvido.

| Qué puede cambiar el usuario | Cómo se expresa | Dónde vive |
|---|---|---|
| Paleta general (fondo, texto, rejilla, ejes) | `--color-*` | `tokens` |
| Color de cada hábito o categoría | Campo `color` del schema | `modelo` |
| Intensidad derivada (celdas, rellenos, hover) | `color-mix()` sobre el color del hábito | `tokens` |
| **Tipo de visualización por métrica** | Campo nuevo en el schema, ver abajo | `modelo` + `panel-tema` |
| Densidad de la gráfica | `--density`, afecta a alto de fila, celda y márgenes | `tokens` |
| Tipografía de ejes y etiquetas | `--font-*`, `--font-size-*` | `tokens` |
| Modo claro / oscuro | `data-theme` en el raíz | `tokens` |
| Radio de las celdas del heatmap | `--radius-sm` | `tokens` |
| Curva de la línea (suave o escalonada) | Preferencia de visualización | `panel-tema` |
| Rejilla visible o no | Preferencia de visualización | `panel-tema` |
| Animación activada o no | `--duration-*` a `0ms`, más `prefers-reduced-motion` | `tokens` |

### Tres reglas que hacen cumplible el contrato

1. Ningún componente de gráfica recibe un color literal. Recibe tokens, o un `--habit-color` que
   viene del schema.
2. Todo lo customizable es **dato** —campo del schema o variable CSS—, nunca una prop fijada en
   el árbol de componentes. Si para cambiar algo hay que tocar JSX, no es customizable.
3. Las tres gráficas comparten el mismo contrato. Que el heatmap sea SVG artesanal no lo exime.

### Deuda que esto abre en `modelo`

El "tipo de visualización por métrica" está en el scope original del proyecto pero **no existe
como campo en el schema aprobado**: `modelo` sólo define una visualización por defecto según el
`type` del hábito. Hace falta añadir algo como un bloque `display` con el tipo de gráfica y las
preferencias de forma.

Eso es un cambio de contenido en una tarjeta ya aprobada, así que va por su propia propuesta
sobre `modelo`, no por aquí. Queda anotado como acción pendiente, no como supuesto.

## Cómo se aplican los colores, en concreto

Vía CSS —clase o `style`—, **no como atributo de presentación** (`fill="var(--x)"`): el soporte
de `var()` dentro de atributos de presentación SVG ha sido irregular entre navegadores. Regla
defensiva y sin coste.

```jsx
<rect className="heatmap-cell" style={{ '--intensity': value }} />
```

```css
.heatmap-cell {
  fill: color-mix(in oklch, var(--habit-color) calc(var(--intensity) * 100%), var(--color-surface));
  rx: var(--radius-sm);
  transition: fill var(--duration-fast) var(--ease-out);
}
```

Con esto, cambiar el tema en runtime no cuesta ni un re-render de React: el navegador recalcula
las variables y repinta.

## Capa compartida

Antes de la primera gráfica hace falta un `features/charts/core` con lo que las tres comparten:

- Contenedor responsive propio, con `ResizeObserver`.
- Ejes y rejilla ya cableados a los tokens.
- Tooltip común, posicionado y accesible.
- Estado vacío ("aún no hay datos"), que es lo que se ve las dos primeras semanas de uso.
- Accesibilidad: cada gráfica es `role="img"` con `aria-label` descriptivo y una tabla
  visualmente oculta con los mismos datos. Una gráfica que sólo existe como píxeles es una
  gráfica que no existe para un lector de pantalla.

## Coste

**Tres o cuatro días** más que la ruta Recharts, casi todos concentrados en la capa compartida y
en el heatmap. Las otras dos gráficas salen después a coste casi nulo.

Corrijo aquí la estimación de la primera versión de esta tarjeta, que decía uno o dos días: no
contaba el contenedor responsive, el tooltip ni la accesibilidad.

Es un coste único y acotado. El techo de Recharts, en cambio, aparecería en `panel-tema`, que es
la tarjeta donde el diferenciador del producto se hace real.

## Consecuencias

- `heatmap` va primera de las tres y paga la capa compartida.
- `series` y `barras` se construyen sobre esa capa; ninguna dibuja sus propios ejes.
- `panel-tema` implementa exactamente la tabla del contrato, ni más ni menos.
- `modelo` necesita una propuesta adicional para el bloque `display`.
- Si más adelante hiciera falta una gráfica exótica, no hay que cambiar de librería.

## Revisión

Si en algún momento pesa más entregar rápido que diferenciarse visualmente, la alternativa es
Recharts para `series` y `barras` con el heatmap a mano, aceptando dos estéticas y un contrato de
customización recortado. Esa revisión sería de la decisión entera, no de una gráfica suelta.

## Firma

La cierra un humano: es la decisión de v1 que más condiciona el aspecto de todo lo que se ve.
