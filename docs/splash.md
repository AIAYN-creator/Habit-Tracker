# Assets de PWA

Todo lo que el sistema operativo necesita para que la app instalada no parezca una página web con
un atajo. Sale entero de `logo.svg`; aquí no se toma ninguna decisión de diseño, se generan
formatos y se verifica en dispositivos reales.

## Generación reproducible

Un script npm —`npm run icons`— que produce todos los ficheros desde el SVG maestro. No se
generan a mano en una web ni se arrastran de un proyecto anterior: la primera vez que haya que
retocar el logo, un proceso manual significa media hora de exportar tamaños y un fichero olvidado.

Los resultados **sí se versionan**: forman parte del build y no deben depender de que el script
funcione en la máquina de turno.

## Inventario

| Fichero                 | Tamaño    | Para qué                               |
| ----------------------- | --------- | -------------------------------------- |
| `favicon.svg`           | vectorial | Navegadores modernos                   |
| `favicon.ico`           | 32        | Respaldo                               |
| `apple-touch-icon.png`  | 180       | iOS, obligatorio: el manifest no basta |
| `icon-192.png`          | 192       | Manifest                               |
| `icon-512.png`          | 512       | Manifest y splash de Android           |
| `icon-maskable-512.png` | 512       | Manifest, con zona de seguridad        |
| `apple-splash-*.png`    | varios    | Pantallas de arranque de iOS           |

### El icono maskable no es el icono normal

Android recorta el icono a la forma que tenga el lanzador —círculo, cuadrado redondeado,
gota— y **recorta hasta un 20% por cada lado**. Reutilizar el icono normal como maskable produce
un logo con los bordes comidos.

Por eso son dos ficheros: el símbolo dentro del círculo central de seguridad, con el fondo de
marca extendido hasta el borde.

## Las splash de iOS

iOS necesita una imagen por combinación de resolución y orientación, declarada con
`apple-touch-startup-image` y su media query. Son bastantes ficheros y ninguno es opcional: sin
la que corresponda, iOS muestra una pantalla en blanco al abrir.

Se generan con `pwa-asset-generator`, que produce imágenes y etiquetas. Se cubren los dispositivos
en uso actual y se acepta que un modelo viejo caiga en el caso por defecto. Perseguir la lista
completa es mantenimiento perpetuo a cambio de medio segundo de arranque en un iPhone de 2017.

## `theme-color` en caliente

El manifest lleva el color de marca, fijo. La etiqueta `<meta name="theme-color">` sí se actualiza
desde JavaScript al cambiar entre claro y oscuro, tal como decidió `pwa`, para que la barra de
estado no quede blanca sobre una app oscura.

Sigue sin seguir la paleta personalizada del usuario: eso sería parpadeo a cambio de nada.

## Verificación en dispositivo real

Lo único que vale. El emulador no reproduce ni el recorte del lanzador ni la splash de iOS.

- Android: instalar, comprobar el icono en el lanzador y el recorte maskable.
- iOS: Compartir → Añadir a pantalla de inicio, comprobar icono, splash y barra de estado.
- Escritorio: instalar desde Chrome y comprobar el icono en la barra de tareas.

## Criterios de aceptación

- [ ] `npm run icons` regenera todos los ficheros desde `logo.svg` sin pasos manuales.
- [ ] Los ficheros generados están versionados y referenciados en manifest y HTML.
- [ ] El icono maskable no pierde nada del símbolo con recorte circular.
- [ ] iOS muestra la splash correcta y no una pantalla en blanco.
- [ ] La barra de estado acompaña al tema claro y al oscuro.
- [ ] Instalación verificada en un Android y un iOS reales.
