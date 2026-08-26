---
description: Logo, marca, favicon y colores de marca coherentes con los design tokens.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Logo e identidad

## La restricción que manda sobre todas

El usuario puede cambiar la paleta entera de la app. **El logo no puede depender de esa paleta.**
Si la marca se pinta con `--color-accent` y alguien elige un amarillo pastel, el icono de la
pantalla de inicio desaparece.

Por tanto: tokens de marca **separados** de los tokens de tema.

```css
:root {
  --brand-ink: oklch(25% 0.03 250);
  --brand-accent: oklch(58% 0.16 250);
}
```

`--brand-*` no aparece en `panel-tema` y no es customizable. Es la única excepción a la regla de
que todo color es configurable, y existe porque una marca que cambia con la configuración no es
una marca.

## Dónde aparece

Pantalla de instalación, icono de la pantalla de inicio, favicon, splash, cabecera de la pantalla
de bienvenida y poco más. Dentro de la app, el logo no debe competir con los datos: la
identidad la lleva el sistema visual, no un logotipo repetido en cada pantalla.

## Restricciones técnicas

- Legible a **16 px** (favicon) y a **512 px** (icono de PWA). Esto descarta cualquier detalle
  fino: a 16 px sobreviven dos formas, no seis.
- Versión **monocroma** que funcione en negro sobre blanco y en blanco sobre negro.
- Versión **maskable**: el sistema operativo recorta el icono a su forma, así que el símbolo vive
  dentro de un círculo de seguridad del 80% central, con el resto de fondo.
- SVG como fuente de verdad; los PNG se generan de ahí.

## Dirección propuesta

Tres caminos, con recomendación:

1. **La celda.** Un cuadrado con esquinas redondeadas, o una retícula mínima de tres por tres con
   celdas de distinta intensidad. Cita directa al heatmap, que es la imagen insignia de la app.
   *Recomendada:* la app se reconoce por esa retícula, y funciona a 16 px porque son formas
   grandes y planas.
2. **La marca de verificación que sube.** Un check cuyo trazo final se prolonga como una línea
   ascendente. Bonito, pero el check es el símbolo más gastado de la categoría.
3. **El punto y la racha.** Una fila de puntos con uno destacado. Elegante y demasiado sutil a
   tamaño pequeño.

Con la primera, el icono maskable es casi inmediato: la retícula centrada sobre un fondo de
`--brand-ink`.

## El nombre

"Habit Tracker" describe la categoría, no el producto: es lo que uno escribe en la barra de
búsqueda, no cómo llama a su app. No bloquea nada —el manifest se cambia en un minuto— pero
conviene decidirlo antes de dibujar un logotipo, porque un nombre corto permite marca
tipográfica y uno largo obliga a símbolo.

**Queda como pregunta abierta para el humano.** Si al aprobar esta tarjeta no hay nombre nuevo,
se sigue con "Habit Tracker" y el logo se diseña como símbolo, que es lo seguro.

## Entregables

| Fichero                               | Uso                                    |
| ------------------------------------- | -------------------------------------- |
| `brand/logo.svg`                      | Maestro, símbolo solo                  |
| `brand/logo-wordmark.svg`             | Símbolo más nombre, para la bienvenida |
| `brand/logo-mono.svg`                 | Monocromo, una sola forma              |
| `public/favicon.svg`                  | Favicon moderno                        |
| `public/favicon.ico`                  | Respaldo, 32 px                        |
| `public/icon-192.png`, `icon-512.png` | Manifest                               |
| `public/icon-maskable-512.png`        | Manifest, con zona de seguridad        |
| `public/apple-touch-icon.png`         | 180 px, obligatorio en iOS             |

## Criterios de aceptación

- [ ] Todos los ficheros de la tabla existen y están referenciados en el manifest y en el HTML.
- [ ] El icono se distingue a 16 px en una pestaña con otras diez pestañas abiertas.
- [ ] El icono maskable respeta la zona de seguridad, verificado con el recorte circular.
- [ ] La versión monocroma es legible en ambas polaridades.
- [ ] El logo no usa ninguna variable de tema, sólo `--brand-*`. Verificado por búsqueda.
- [ ] Instalada en un móvil real, el icono se ve correcto en la pantalla de inicio.
