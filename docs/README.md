# Decisiones

Espejo de las tarjetas **aprobadas** del tablero de Histos con el que se lleva este proyecto.
Cada fichero es una decisión cerrada y firmada, no un borrador.

### Producto y decisiones

| Documento                  | Qué fija                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| [vision.md](vision.md)     | Diferenciador, principios, alcance de v1 y qué queda fuera             |
| [modelo.md](modelo.md)     | Modelo de datos schema-driven: hábitos, moods y entradas               |
| [charts.md](charts.md)     | ADR de la librería de gráficas y contrato de customización             |
| [adr-repo.md](adr-repo.md) | ADR de la estructura del repo privado de datos                         |
| [flujos.md](flujos.md)     | Navegación y los cinco flujos de uso, estados no felices incluidos     |
| [adr-sync.md](adr-sync.md) | ADR de sincronización: fusión a tres bandas y resolución de conflictos |

### Técnicas

| Documento                | Qué fija                                                      |
| ------------------------ | ------------------------------------------------------------- |
| [repo.md](repo.md)       | Licencia, convención de commits y separación código/datos     |
| [stack.md](stack.md)     | Stack, estructura de carpetas y reglas de dependencia         |
| [tooling.md](tooling.md) | ESLint, Prettier, Vitest, pre-commit y qué se prueba          |
| [pwa.md](pwa.md)         | Manifest, caché, actualizaciones y el borrado de datos en iOS |
| [dexie.md](dexie.md)     | Tablas de IndexedDB, claves, transacciones y migraciones      |
| [dal.md](dal.md)         | Capa de acceso a datos: superficie, atomicidad y fechas       |
| [ci.md](ci.md)           | Flujos de verificación y despliegue a GitHub Pages            |

### Diseño

| Documento                      | Qué fija                                                |
| ------------------------------ | ------------------------------------------------------- |
| [tokens.md](tokens.md)         | Design tokens: color, tipografía, espaciado, densidad   |
| [ui-kit.md](ui-kit.md)         | Las catorce primitivas y la línea base de accesibilidad |
| [logo.md](logo.md)             | Identidad, tokens de marca y entregables de icono       |
| [iconos.md](iconos.md)         | Set de iconos e ilustraciones de estados vacíos         |
| [splash.md](splash.md)         | Generación y verificación de los assets de PWA          |
| [panel-tema.md](panel-tema.md) | El panel donde el usuario ejerce la customización       |

## Sobre la fuente de verdad

El tablero de Histos es el canon: aquí sólo se copia lo ya aprobado, para que quien lea el
código tenga las decisiones al lado sin depender del vault. Si un documento y el código se
contradicen, gana el documento; si un documento y el tablero se contradicen, gana el tablero y
este espejo está desactualizado.

Estos ficheros **no se editan a mano**. Un cambio de decisión se propone y se aprueba en el
tablero, y de ahí baja aquí.

## Deuda anotada

- `dexie` necesita una séptima tabla, `syncBase`, para guardar la última versión sincronizada de
  cada fichero. Sin ella no hay base para la fusión a tres bandas de [adr-sync.md](adr-sync.md).
- `adr-repo` necesita un `settings.json` donde vivan las preferencias de tema que se sincronizan.
  Ver [panel-tema.md](panel-tema.md).
- `modelo` necesita un bloque `display` en `habits.json` para el tipo de visualización por
  métrica. Está en el scope del proyecto, no en el schema aprobado. Ver la sección
  correspondiente de [charts.md](charts.md).

## Decisiones abiertas

- **Nombre de la app.** "Habit Tracker" describe la categoría, no el producto. Bloquea el
  logotipo, no el código. Ver [logo.md](logo.md).
- **Historial de borrados en el repo de datos.** Borrar una entrada no la borra del historial de
  Git. Ver [adr-repo.md](adr-repo.md).
