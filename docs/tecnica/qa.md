# QA y criterios de salida de v1

La puerta de salida. No es "probarlo un rato": es una lista de escenarios reproducibles, cada uno
con su criterio de aprobado, ejecutada sobre dispositivos reales.

## Un repo de datos aparte para probar

**Ningún escenario de QA se ejecuta contra `habit-tracker-data`.** Se crea un repo privado
`habit-tracker-data-test`, y los tokens de prueba se acotan a él.

El motivo es concreto: varios de estos escenarios provocan conflictos a propósito, y uno de ellos
comprueba qué pasa al borrar datos locales. Hacerlo contra el almacén real sería ensuciar meses de
historial con basura de pruebas, y todo eso queda en el historial de Git para siempre, como
advierte `adr-repo`.

## Dispositivos

| Plataforma | Por qué está |
|---|---|
| Android real, Chrome | Instalación, icono maskable, vibración |
| iOS real, Safari | Donde vive casi todo el riesgo: instalación manual, splash, borrado de datos |
| Escritorio, Chrome | Uso con teclado y ventana grande |
| Escritorio, Firefox | Motor distinto: `color-mix`, OKLCH, IndexedDB |

Los emuladores valen para desarrollar y no valen para esto.

## Escenarios

### Instalación y arranque

1. Instalar en Android desde el navegador. Icono correcto en el lanzador, sin bordes comidos.
2. Instalar en iOS con Compartir → Añadir a pantalla de inicio, siguiendo la ayuda de la propia
   app. Icono, splash y color de barra de estado correctos.
3. Primer arranque: crear dos hábitos desde las sugerencias y registrar hoy, sin pasar por
   sincronización.
4. `navigator.storage.persist()` solicitado y su resultado visible en Ajustes.

### Offline

5. Modo avión desde frío: la app arranca, registra, y el historial y las gráficas se ven.
6. Registrar tres días distintos sin red, cerrar la app por completo, reabrir: nada perdido, cola
   con tres elementos.
7. Recuperar la red: la cola se vacía sola y produce **un solo commit** en el repo de pruebas.

### Sincronización

8. Conectar con un token de grano fino acotado al repo de pruebas, siguiendo sólo las
   instrucciones de la app. Se cronometra: si lleva más de tres minutos, la guía no es
   suficientemente buena.
9. Dos dispositivos, **días distintos**: convergen sin conflicto.
10. Dos dispositivos, **claves distintas del mismo día**: se conservan ambos valores.
11. Dos dispositivos, **la misma clave**: gana el último y el descarte queda en el registro de
    conflictos, recuperable desde ahí.
12. Revocar el token en GitHub con la app abierta: aviso claro, registro diario intacto.
13. Un fichero del repo editado a mano con JSON inválido: se avisa, no se toca y el resto sigue.

### Restauración

14. Borrar los datos locales y volver a sincronizar: el estado se reconstruye entero desde el
    repo.
15. Dispositivo nuevo con el mismo repo: mismos datos, sin proceso de importación aparte.

### Schema

16. Archivar un hábito con historial: desaparece del registro diario, sigue en historial y
    gráficas.
17. Ampliar el rango de una escala: permitido, datos intactos.
18. Reducirlo con valores fuera de rango: bloqueado, indicando cuántas entradas afecta.
19. Intentar cambiar el tipo: no ofrecido; la alternativa de archivar y crear funciona.

### Actualización

20. Publicar una versión nueva con la app abierta a media entrada: aparece el aviso, **no** se
    recarga sola, y al recargar no se ha perdido lo registrado.

## No funcional

- **Lighthouse**: categoría PWA sin errores; rendimiento razonable en móvil simulado.
- **Arranque**: interactivo en menos de dos segundos en un móvil de gama media, con datos de un
  año cargados.
- **`axe-core`** sin violaciones en las seis pantallas.
- **Lectores de pantalla**: recorrido del registro diario con VoiceOver y con TalkBack.
- **Registro del día completo en menos de treinta segundos**, cronometrado, que es el criterio que
  fijó `vision`.

## Dos semanas de uso real

Ningún plan de pruebas detecta lo que se nota usando una app de hábitos a diario: que un control
cansa, que el orden de la pantalla no acompaña, que se olvida abrirla.

Así que la última fase es **usarla de verdad durante dos semanas**, contra el repo real, con los
hábitos propios y sin tocar el código salvo para fallos que rompan datos. Lo que aparezca se anota
y se clasifica en "bloquea v1" o "va después".

## Criterios de salida

v1 sale cuando:

- [ ] Los veinte escenarios pasan en las cuatro plataformas que aplican.
- [ ] Ninguna prueba no funcional falla.
- [ ] Las dos semanas de uso real terminan sin un fallo que pierda o corrompa datos.
- [ ] Los criterios de éxito de `vision` se cumplen los cinco, comprobados uno a uno.
- [ ] Los fallos conocidos que no bloquean están escritos y aceptados por escrito.

## Qué no bloquea el lanzamiento

Dicho de antemano para no discutirlo con las prisas: detalles visuales en navegadores fuera de la
tabla, ausencia de traducciones, rendimiento con más de cinco años de datos simulados, y cualquier
cosa que sólo se reproduzca con las herramientas de desarrollo abiertas.

## Criterios de aceptación

- [ ] El repo `habit-tracker-data-test` existe y los tokens de prueba se acotan a él.
- [ ] Cada escenario tiene resultado registrado, con dispositivo y fecha.
- [ ] Los fallos encontrados están clasificados en bloqueantes y no bloqueantes.
- [ ] La lista de fallos conocidos aceptados está escrita antes de etiquetar `v1.0.0`.
