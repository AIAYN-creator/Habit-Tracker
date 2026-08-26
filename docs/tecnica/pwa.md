---
description: Manifest, service worker, shell offline e instalación en móvil sin app
  store.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# PWA instalable

El principio de `vision` es que la app funciona al 100% sin red. Esta tarjeta es donde eso deja
de ser una intención y pasa a ser verificable.

## Herramienta

`vite-plugin-pwa` con Workbox en modo `generateSW`. No hace falta escribir el service worker a
mano: lo que se cachea es el shell de la aplicación, que es exactamente el caso para el que ese
modo está pensado.

## Manifest

| Campo | Valor | Nota |
|---|---|---|
| `name` | Habit Tracker | Ver la nota sobre el nombre en `logo` |
| `short_name` | Habits | Lo que cabe bajo el icono |
| `start_url` | `/Habit-Tracker/` | Con el `base` de `stack`; sin esto la app instalada abre un 404 |
| `scope` | `/Habit-Tracker/` | |
| `display` | `standalone` | Sin barra de navegador |
| `orientation` | `portrait` | Es una app de móvil; el escritorio funciona igual |
| `background_color` | Color de marca | Fijo |
| `theme_color` | Color de marca | Fijo, ver abajo |
| `icons` | 192, 512 y maskable | Los produce `logo` |

### El `theme_color` no puede ser un token

El manifest es un JSON estático: no entiende variables CSS y se lee antes de que la app arranque.
Así que el color de la barra de estado en la instalación es el color de **marca**, no el color de
acento que el usuario elija.

Una vez la app está en marcha sí se puede ajustar en caliente, actualizando la etiqueta
`<meta name="theme-color">` desde JavaScript al cambiar de tema claro a oscuro. Eso entra aquí;
seguir la paleta personalizada del usuario, no: es parpadeo a cambio de nada.

## Estrategia de caché

- **Shell de la app** (HTML, JS, CSS, fuentes, iconos): precache con revisión por hash. Vite ya
  pone hash en los nombres, así que la invalidación es correcta por construcción.
- **Datos del usuario**: no se cachean. Viven en IndexedDB, que no pasa por el service worker.
  Esta separación es la que hace que el modo offline sea real y no una ilusión de caché.
- **API de GitHub**: nunca se cachea. Una respuesta de sincronización servida desde caché es una
  forma elegante de corromper datos.

## Actualizaciones

`registerType: 'prompt'`, no `autoUpdate`. Cuando hay versión nueva, aparece un aviso discreto
—"Hay una versión nueva. Recargar."— y el usuario decide.

El motivo es concreto: con `autoUpdate`, el service worker puede recargar la página mientras
alguien está a media entrada del día. Perder lo que estabas escribiendo por una actualización
silenciosa es justo el tipo de detalle que hace que se abandone una app de hábitos.

## El problema serio: iOS puede borrarte los datos

En iOS, Safari **elimina el almacenamiento local de sitios que no se visitan en siete días**.
Para una app local-first cuya fuente de verdad es IndexedDB, eso no es un detalle: es pérdida de
datos silenciosa en el escenario más plausible —irse de vacaciones dos semanas.

Tres mitigaciones, y las tres entran en v1:

1. **`navigator.storage.persist()`** en el primer arranque. En una PWA instalada en la pantalla
   de inicio, iOS es mucho más permisivo y suele concederlo. Registrar el resultado y mostrarlo
   en ajustes.
2. **Sincronizar al abrir y al cerrar** por defecto, no sólo a petición. El repo de GitHub es la
   copia de seguridad real; cuanto menos tiempo pase un cambio sólo en local, menos hay que
   perder.
3. **Avisar en ajustes** si el almacenamiento persistente fue denegado, explicando en una frase
   que conviene instalar la app y sincronizar a menudo.

## Otras particularidades de iOS

- No hay `beforeinstallprompt`: no se puede ofrecer un botón de "Instalar". La instalación es
  Compartir → Añadir a pantalla de inicio, y hay que explicarlo con una ayuda contextual.
- Hace falta `apple-touch-icon` de 180 px; el manifest solo no basta.
- La splash screen se genera a partir del manifest en versiones recientes, pero conviene
  verificar en el dispositivo real y no fiarse del emulador.

## Estado de conexión

Un indicador honesto: `navigator.onLine` más el resultado real de la última petición, porque
`onLine` en `true` con una wifi de hotel sin salida es el caso habitual, no la excepción. La UI
de esto la define `estado-sync`; aquí sólo se expone la señal.

## Criterios de aceptación

- [ ] La app se instala en Android y en iOS desde el navegador.
- [ ] En modo avión, tras la primera visita, arranca y permite registrar y consultar el historial.
- [ ] `start_url` abre la app instalada, no un 404. Verificado en el despliegue real de Pages.
- [ ] Al publicar una versión nueva aparece el aviso de recarga, y no se recarga sola.
- [ ] `navigator.storage.persist()` se solicita y su resultado es visible en ajustes.
- [ ] Auditoría de Lighthouse en la categoría PWA sin errores.
