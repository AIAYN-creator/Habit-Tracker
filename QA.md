# QA de v1

Los veinte escenarios de [docs/tecnica/qa.md](docs/tecnica/qa.md), con su resultado. Se rellena a
mano según se van pasando: una casilla marcada significa que alguien lo hizo y funcionó, no que
debería funcionar.

**Antes de empezar:** crea `habit-tracker-data-test`, privado, y usa tokens acotados a él. Varios
de estos escenarios provocan conflictos a propósito y uno borra los datos locales; hacerlo contra
el almacén real ensuciaría meses de historial, y eso queda en Git para siempre.

## Dispositivos

| #   | Plataforma           | Por qué está                                  |
| --- | -------------------- | --------------------------------------------- |
| A   | Android real, Chrome | Instalación, icono maskable, vibración        |
| B   | iOS real, Safari     | Donde vive casi todo el riesgo                |
| C   | Escritorio, Chrome   | Teclado y ventana grande                      |
| D   | Escritorio, Firefox  | Motor distinto: `color-mix`, OKLCH, IndexedDB |

## Instalación y arranque

- [ ] 1. Instalar en Android. Icono correcto en el lanzador, sin bordes comidos.
- [ ] 2. Instalar en iOS con Compartir → Añadir a pantalla de inicio. Icono, splash y barra de estado correctos.
- [ ] 3. Primer arranque: crear dos hábitos y registrar hoy, sin pasar por sincronización.
- [ ] 4. El almacenamiento persistente se solicita, y su resultado se ve en Sincronización.

## Offline

- [ ] 5. Modo avión desde frío: arranca, registra, historial y gráficas visibles.
- [ ] 6. Registrar tres días sin red, cerrar la app del todo, reabrir: nada perdido.
- [ ] 7. Recuperar la red: la cola se vacía sola y produce **un solo commit**.

## Sincronización

- [ ] 8. Conectar el token siguiendo sólo lo que dice la app. **Cronometrar**: más de tres minutos significa que la guía no es bastante buena.
- [ ] 9. Dos dispositivos, días distintos: convergen sin conflicto.
- [ ] 10. Dos dispositivos, claves distintas del mismo día: se conservan ambos valores.
- [ ] 11. Dos dispositivos, la misma clave: gana el último y el descarte queda en el registro, recuperable.
- [ ] 12. Revocar el token con la app abierta: aviso claro, registro diario intacto.
- [ ] 13. Editar a mano un fichero del repo dejándolo inválido: se avisa, no se toca, el resto sigue.

## Restauración

- [ ] 14. Borrar los datos locales y sincronizar: el estado se reconstruye entero.
- [ ] 15. Dispositivo nuevo con el mismo repo: mismos datos, sin importación aparte.

## Schema

- [ ] 16. Archivar un hábito con historial: sale del registro diario, sigue en historial y gráficas.
- [ ] 17. Ampliar el rango de una escala: permitido, datos intactos.
- [ ] 18. Reducirlo con valores fuera de rango: bloqueado, indicando cuántas entradas afecta.
- [ ] 19. Cambiar el tipo: no se ofrece; archivar y crear funciona.

## Actualización

- [ ] 20. Publicar una versión con la app abierta a media entrada: aparece el aviso, **no** recarga sola, y al recargar no se ha perdido nada.

## No funcional

- [ ] Lighthouse: categoría PWA sin errores.
- [ ] Interactivo en menos de dos segundos en un móvil de gama media con un año de datos.
- [ ] Recorrido del registro diario con VoiceOver y con TalkBack.
- [ ] Registrar el día completo en **menos de treinta segundos**, cronometrado.
- [ ] Sin desbordamiento horizontal a 320 px ni con zoom del 200%.

## Ya verificado de forma automática

Esto corre en cada commit y no hace falta repetirlo a mano:

- 104 tests, incluidos los tres casos de conflicto de `adr-sync` y la atomicidad de las escrituras.
- `axe-core` sin violaciones en la pantalla principal.
- Un único `h1`, regiones con nombre, ningún control sin nombre accesible.

## Dos semanas de uso real

La última fase, y no es opcional. Ningún plan de pruebas detecta que un control cansa, que el
orden de la pantalla no acompaña o que se olvida abrir la app.

Usarla de verdad durante dos semanas, contra el repo real, sin tocar el código salvo para fallos
que rompan datos. Lo que aparezca se anota abajo.

| Día | Qué pasó | ¿Bloquea v1? |
| --- | -------- | ------------ |
|     |          |              |

## Criterios de salida

v1 sale cuando:

- [ ] Los veinte escenarios pasan en las plataformas que aplican.
- [ ] Ninguna prueba no funcional falla.
- [ ] Las dos semanas terminan sin un fallo que pierda o corrompa datos.
- [ ] Los cinco criterios de éxito de [vision](docs/producto/vision.md) se cumplen, uno a uno.
- [ ] Los fallos conocidos que no bloquean están escritos y aceptados aquí.

## Fallos conocidos aceptados

Se rellena antes de etiquetar `v1.0.0`, para no discutirlo con las prisas.

| Fallo | Por qué no bloquea |
| ----- | ------------------ |
|       |                    |
