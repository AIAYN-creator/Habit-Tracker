# Micro-interacciones

Lo que hace que marcar un hábito se sienta bien en lugar de sentirse como rellenar un formulario.
Es el terreno donde una app de registro diario se gana el uso, y también donde más fácil es
pasarse.

## Regla de oro

**Ninguna animación retrasa una acción.** El dato se escribe en el momento; la animación acompaña,
nunca precede. Si la transición dura 200 ms, el estado ya cambió en el milisegundo cero.

Una animación que hay que esperar es un impuesto que se paga trescientas sesenta y cinco veces al
año.

## Dónde sí

| Momento | Qué pasa | Duración |
|---|---|---|
| Marcar un booleano | El relleno crece desde el punto tocado | `--duration-fast` |
| Cambiar un contador | La cifra desliza hacia arriba o abajo | `--duration-fast` |
| Elegir en una escala | El indicador se desplaza al segmento | `--duration-fast` |
| Abrir un `Sheet` | Entra desde abajo, con desaceleración | `--duration-base` |
| Aparecer un toast | Entra desde abajo, sale desvaneciéndose | `--duration-base` |
| Cambiar de mes | El calendario desliza en la dirección del gesto | `--duration-base` |
| Cargar una gráfica | Las barras crecen desde la base, una sola vez | `--duration-slow` |

Todas las duraciones salen de `tokens`. Ninguna se escribe a mano en un componente.

## Dónde no

- **Al cambiar de pestaña.** Cuatro destinos que se tocan constantemente: una transición entre
  ellos es medio segundo perdido cada vez.
- **Al reordenar la lista de hábitos.** El arrastre ya es la animación.
- **Al repintar una gráfica** porque cambió el tema. Es un cambio de color, no un evento.
- **Nada que se repita en bucle.** Ningún elemento animado permanentemente en una pantalla que se
  mira a diario.

## Movimiento reducido

Con `prefers-reduced-motion`, `tokens` pone las duraciones a cero y con eso basta para casi todo.
Lo que hay que revisar a mano son las animaciones de **posición**: conviene sustituir el
deslizamiento de un `Sheet` por un desvanecido muy corto en lugar de eliminarlo del todo, porque
un panel que surge de la nada desorienta más que uno que aparece deprisa.

## Framer Motion, con moderación

Sólo donde una transición CSS no llega: entrada y salida de elementos del DOM —`Sheet`, `Dialog`,
`Toast`— y el gesto de arrastre. Todo lo demás, con `transition` de CSS.

El motivo es de peso, literal: importar la librería en cada componente que quiera un fundido es
como se acaba con un bundle de animaciones más grande que la propia app.

## Vibración

El pulso corto al marcar lo define `inputs`. Aquí sólo se fija que va sincronizado con el inicio
de la animación, no con su final.

## Criterios de aceptación

- [ ] Ninguna escritura espera a una animación. Verificado desactivándolas.
- [ ] Todas las duraciones vienen de tokens; ninguna literal en componentes.
- [ ] Con movimiento reducido no hay desplazamientos, y los paneles se desvanecen.
- [ ] Framer Motion sólo aparece en los componentes que lo necesitan.
- [ ] No hay ninguna animación en bucle en toda la app.
- [ ] Cambiar de pestaña es instantáneo.
