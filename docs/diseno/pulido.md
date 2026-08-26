# Pase de pulido visual

El punto en el que la app deja de parecer un prototipo. Es la tarjeta con más dependencias del
tablero, y a propósito: pulir mientras las piezas todavía cambian de forma es trabajo que se tira.

**No es un rediseño.** Si algo hay que replantear, sale de aquí como tarjeta propia. Esto es una
pasada sistemática con lista en mano, no una sesión de retoques por intuición.

## Ritmo y espaciado

Recorrido pantalla por pantalla comprobando que todo el espaciado sale de la escala de `tokens`.
El fallo típico no es usar un valor feo: es usar `--space-3` en una pantalla y `--space-4` en la
equivalente de al lado, y que el conjunto se sienta descuidado sin que se sepa por qué.

También: anchos máximos coherentes, alineación óptica de iconos con el texto —que casi nunca
coincide con la alineación matemática— y separaciones iguales entre bloques equivalentes.

## Cifras que no bailan

`font-variant-numeric: tabular-nums` en todo lo que muestre números que cambian: contadores,
duraciones, valores de escala, ejes de gráficas.

Sin esto, pasar de 9 a 10 en un contador desplaza lateralmente todo lo que hay al lado, porque el
1 es más estrecho que el 9. Es un detalle diminuto que se nota trescientas sesenta y cinco veces
al año.

## La matriz de estados

Cada pantalla, en cada estado. Es la parte aburrida y la que más se nota:

| | Vacío | Cargando | Error | Con datos |
|---|---|---|---|---|
| Hoy | ✓ | ✓ | — | ✓ |
| Calendario | ✓ | ✓ | — | ✓ |
| Lista | ✓ + sin resultados | ✓ | — | ✓ |
| Gráficas | ✓ pocos datos | ✓ | — | ✓ |
| Hábitos | ✓ | ✓ | ✓ validación | ✓ |
| Sincronización | — | ✓ | ✓ token | ✓ |

"Cargando" y "vacío" no son lo mismo, y con `useLiveQuery` la primera respuesta es `undefined`:
la trampa es enseñar el estado vacío durante 200 ms antes de que lleguen los datos, que produce un
parpadeo desagradable en cada arranque. Un esqueleto sólo si la espera pasa de unos 150 ms.

## Áreas seguras

La app instalada corre a pantalla completa, así que el contenido puede quedar bajo la muesca o
tapado por la barra de gestos. `env(safe-area-inset-*)` en la cabecera y en la barra de
navegación inferior.

Se comprueba en un dispositivo real con muesca. El emulador miente en esto.

## Los dos temas y las dos densidades

Cuatro combinaciones por pantalla. Lo que suele romperse: sombras que desaparecen en oscuro
—`tokens` ya las sustituye por borde, hay que verificar que se aplica—, contrastes de texto
atenuado, y objetivos táctiles en densidad compacta.

## Microcopia

Una pasada de texto con criterio uniforme: infinitivo en las acciones, sin signos de exclamación,
sin felicitaciones, sin humor. Una app que se abre todos los días durante años tiene que envejecer
bien, y el tono jovial es lo primero que cansa.

Los mensajes de error dicen qué pasó y qué hacer. Nada de "Vaya, algo ha salido mal".

## Método

Capturas de las seis pantallas en las cuatro combinaciones de tema y densidad, puestas en una
retícula. Los problemas de coherencia sólo se ven comparando, nunca pantalla a pantalla, y esa
retícula es también el antes y el después que justifica la tarjeta.

## Criterios de aceptación

- [ ] Ningún espaciado, color o tamaño literal fuera de `tokens`, verificado por búsqueda.
- [ ] Todas las cifras cambiantes usan cifras tabulares.
- [ ] La matriz de estados está completa y revisada.
- [ ] Ningún parpadeo de estado vacío durante la carga inicial.
- [ ] Áreas seguras respetadas, comprobado en un móvil con muesca.
- [ ] Las seis pantallas revisadas en las cuatro combinaciones de tema y densidad.
- [ ] Pasada de microcopia hecha, sin exclamaciones ni felicitaciones.
