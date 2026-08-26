---
description: Botón, input, sheet, toast y primitivas de layout sobre los design tokens.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Componentes base

Las primitivas mínimas para construir v1, todas apoyadas en los tokens de `tokens`. Ni una más:
un ui-kit que crece por si acaso es un cajón de componentes sin usar que hay que mantener igual.

## Inventario

| Componente | Para qué | Notas |
|---|---|---|
| `Button` | Acciones | Variantes `primary`, `ghost`, `danger`; tamaños `sm`, `md` |
| `IconButton` | Acciones en barras y cabeceras | Área táctil completa aunque el icono sea pequeño |
| `Input` | Texto y números | Con estados de error |
| `Textarea` | Notas del día | Autoajuste de alto |
| `Switch` | Ajustes booleanos | No para hábitos: eso lo resuelve `inputs` |
| `Select` | Listas cortas | `<select>` nativo estilado; el nativo en móvil es mejor que cualquier réplica |
| `Field` | Etiqueta, ayuda y error | Cablea `id`, `aria-describedby` y `aria-invalid` |
| `Sheet` | Formularios en móvil | Panel inferior; el patrón por defecto de la app |
| `Dialog` | Confirmaciones | Sólo para acciones destructivas |
| `Toast` | Confirmación y deshacer | Con acción opcional, ver abajo |
| `Surface` | Tarjeta o panel | Fondo, borde y radio desde tokens |
| `Stack` / `Grid` | Composición | Espaciado desde la escala, nunca márgenes sueltos |
| `EmptyState` | Sin datos | Ilustración de `iconos`, título y acción |
| `Skeleton` | Carga | Sólo donde la carga sea perceptible |

Lo que **no** entra: tablas, acordeones, menús desplegables, tooltips genéricos, breadcrumbs,
paginación. Si alguna pantalla acaba necesitándolos, se añaden entonces.

## Estilado

**CSS Modules.** Vite los soporta sin configuración, no tienen coste en tiempo de ejecución, el
ámbito es local por fichero y el resultado es CSS plano que consume variables. Un CSS-in-JS
añadiría runtime y una capa de indirección justo en la parte de la app que más se repinta.

La regla de `tokens` se aplica sin excepciones: **ningún fichero de `src/ui` contiene un color,
un tamaño de fuente o un espaciado literal.** Es verificable con una búsqueda, y así se verifica
en los criterios de aceptación.

## Composición antes que configuración

Un `Button` con doce props booleanas es un componente que nadie recuerda cómo usar. Las variantes
son un `variant` y un `size`, y todo lo demás se compone desde fuera. Si un caso necesita algo
que no encaja, se compone con `Surface` y `Stack` en la feature, no se le añade una prop al
componente base.

## Accesibilidad de partida

No es una capa que se pone al final; `a11y` audita, no construye desde cero.

- Anillo de foco visible con `:focus-visible`, con su propio token, en todo lo interactivo.
- Área táctil mínima de 44 px en móvil, incluso cuando el elemento visible sea menor. Esto se
  apoya en el suelo de 36 px de `--control-height` que fijó `tokens`, ampliado con pseudo-elemento
  donde haga falta.
- `Sheet` y `Dialog`: foco atrapado dentro, cierre con `Escape`, devolución del foco al elemento
  que los abrió, y `aria-modal`. Es la parte con más trampa de todo el ui-kit, y la razón de que
  sean dos componentes propios y no dos `div` con posición fija.
- Todo icono sin texto lleva `aria-label`.

## `Toast` y el deshacer

Merece un apartado porque es un componente con responsabilidad de producto, no sólo visual. El
registro diario no tiene botón de guardar —lo decide `flujos`—, así que el toast con "Deshacer"
es la red de seguridad de cada escritura accidental. Requisitos: uno solo a la vez, permanece al
menos cinco segundos, y la acción de deshacer revierte la escritura en `dal`, no sólo la UI.

## Movimiento

Las transiciones usan `--duration-*` y `--ease-*`. `Sheet` y `Dialog` animan con Framer Motion,
que ya está en el stack; el resto, con transiciones CSS. Todo respeta `prefers-reduced-motion`,
que en la práctica significa duración cero, no una animación más lenta.

## Pruebas

Comportamiento, no apariencia: que `Sheet` atrapa el foco, que `Escape` cierra, que `Field` cablea
el `aria-describedby`, que `Toast` deshace de verdad. Nada de snapshots.

## Criterios de aceptación

- [ ] Los catorce componentes del inventario existen y se usan al menos una vez en la app.
- [ ] Una búsqueda de colores y tamaños literales en `src/ui` no devuelve resultados.
- [ ] Toda la app es navegable con teclado, con foco siempre visible.
- [ ] `Sheet` y `Dialog` pasan tests de foco atrapado, cierre con `Escape` y devolución de foco.
- [ ] Cambiar `--density` recompone los componentes sin romper el mínimo táctil.
- [ ] Con `prefers-reduced-motion` activo no hay ninguna animación.
