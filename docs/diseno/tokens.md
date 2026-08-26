---
description: CSS variables para paleta, tipografía, escala de espaciado y densidad
  de UI.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Design tokens

Si la customización es el producto, los tokens no son una capa de estilo: son la API pública del
tema. Todo lo que el usuario puede tocar en `panel-tema` es una variable de aquí, y todo lo que
no esté aquí, no se puede customizar.

## Tres capas

1. **Primitivas** — valores crudos, sin significado. `--blue-500`, `--space-4`. No se usan
   directamente en componentes.
2. **Semánticas** — el rol que cumple el valor. `--color-surface`, `--color-text-muted`,
   `--color-accent`. Es lo que consumen los componentes.
3. **De componente** — sólo cuando un componente necesita una excepción de verdad.
   `--button-height`. Se derivan de las semánticas.

**Regla dura: ningún componente escribe un color, un tamaño de fuente o un espaciado literal.**
Si un componente necesita algo que no existe como token, se añade el token. Es lo que hace que
cambiar el tema afecte a toda la app en lugar de al 80% de la app, que es la diferencia entre
customización real y customización de demo.

## Implementación

CSS custom properties sobre `:root`, sin CSS-in-JS. Cambiar un tema es reescribir variables en
el elemento raíz: no hay recompilación, no hay re-render de React, y las gráficas SVG de `charts`
se enteran solas porque sus atributos apuntan a `var(--...)`.

```css
:root {
  --color-bg: oklch(98% 0.005 250);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(25% 0.02 250);
  --color-text-muted: oklch(55% 0.02 250);
  --color-accent: oklch(60% 0.15 250);
  --color-border: oklch(90% 0.01 250);
}

:root[data-theme="dark"] {
  --color-bg: oklch(18% 0.01 250);
  --color-surface: oklch(23% 0.012 250);
  --color-text: oklch(95% 0.01 250);
  --color-text-muted: oklch(70% 0.015 250);
  --color-border: oklch(32% 0.015 250);
}
```

### Por qué OKLCH y no hex

Porque el usuario elige un color por hábito y la app tiene que derivar de él media docena de
variantes: fondo suave para el heatmap, estado hover, borde, versión atenuada para los días no
esperados. En hex, eso son cálculos que producen resultados sucios y contrastes impredecibles. En
OKLCH la luminosidad es perceptualmente uniforme, así que bajar L un 20% se ve igual de fuerte en
un rojo que en un azul.

Las derivadas se calculan con `color-mix()` en CSS, no en JavaScript:

```css
.habit-cell {
  --habit: var(--habit-color, var(--color-accent));
  background: color-mix(in oklch, var(--habit) calc(var(--intensity) * 100%), var(--color-surface));
}
```

Esto también resuelve el heatmap: la intensidad de cada celda es un número entre 0 y 1 pasado
como variable, y el degradado sale solo del color del hábito. Sin escalas de color hardcodeadas
por hábito.

## Familias de tokens

| Familia | Prefijo | Notas |
|---|---|---|
| Color | `--color-*` | Roles semánticos; el modo oscuro sólo redefine estas |
| Color de hábito | `--habit-color` | Lo inyecta cada componente desde el schema |
| Tipografía | `--font-sans`, `--font-size-*`, `--line-height-*`, `--font-weight-*` | Escala modular, ratio 1.2 |
| Espaciado | `--space-1` … `--space-12` | Base de 4 px |
| Radio | `--radius-sm/md/lg/full` | |
| Sombra | `--shadow-sm/md/lg` | Discretas; en oscuro se sustituyen por borde |
| Movimiento | `--duration-fast/base/slow`, `--ease-*` | Los consume `micro` |
| Densidad | `--density` | Ver abajo |

## Densidad

Un único multiplicador, no un juego de tokens paralelo:

```css
:root { --density: 1; }        /* cómoda */
:root[data-density="compact"] { --density: 0.75; }

--space-4: calc(16px * var(--density));
--control-height: calc(44px * var(--density));
```

Con dos matices que no se negocian: **el tamaño de fuente no se multiplica por la densidad**
—reducir espaciado es legítimo, hacer el texto ilegible no— y `--control-height` tiene un suelo
de 36 px vía `max()`, porque por debajo de eso los objetivos táctiles en móvil empiezan a fallar.

## Tipografía configurable

Tres stacks predefinidos —sans neutra, serif, monoespaciada— más la opción de una fuente del
sistema. Nada de cargar fuentes arbitrarias desde una URL en v1: es superficie de red en una app
que presume de funcionar offline.

## Modo claro y oscuro

`data-theme` en el elemento raíz con tres estados: `light`, `dark` y ausencia del atributo, que
significa seguir a `prefers-color-scheme`. La preferencia se guarda con el resto de la
configuración de tema y viaja en la sincronización.

## Contraste

Las combinaciones por defecto cumplen WCAG AA (4.5:1 en texto normal, 3:1 en texto grande y
elementos de interfaz). Para colores elegidos por el usuario, el sistema no puede garantizarlo:
`a11y` define qué hace la app cuando alguien elige un amarillo sobre blanco —avisar, y elegir
automáticamente texto claro u oscuro según la L del color—, pero la restricción se declara aquí:
**el color de un hábito nunca se usa como color de texto sobre un fondo arbitrario**, sólo como
relleno, borde o fondo con su texto calculado.

## Criterios de aceptación

- [ ] `src/styles/tokens.css` con las tres capas y todas las familias de la tabla.
- [ ] Tema claro y oscuro completos, conmutables con un atributo en el raíz.
- [ ] Cambiar `--density` reordena la UI sin tocar tamaños de fuente ni bajar de 36 px de control.
- [ ] Una celda de ejemplo deriva sus variantes de un `--habit-color` arbitrario vía `color-mix()`.
- [ ] Comprobado que ningún fichero de `src/ui` contiene un color literal.
