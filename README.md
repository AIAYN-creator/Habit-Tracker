# Habit Tracker

[![ci](https://github.com/AIAYN-creator/Habit-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/AIAYN-creator/Habit-Tracker/actions/workflows/ci.yml)

Tracker de hábitos y estado de ánimo **local-first**, instalable como PWA, que guarda los datos en
el dispositivo y los sincroniza contra un repositorio privado de GitHub del propio usuario. Sin
servidor, sin base de datos gestionada, sin cuenta que crear.

**En vivo:** <https://aiayn-creator.github.io/Habit-Tracker/>

> Captura pendiente: se añade cuando haya interfaz de verdad.

## Principios

- **Local-first** — funciona al 100% sin red; la sincronización es una capa añadida, nunca una dependencia.
- **Schema-driven** — los hábitos y las dimensiones de mood se definen como datos, no se hardcodean.
- **Customización real** — paleta, tipografía, densidad y tipo de visualización son configurables en runtime.
- **Empezar simple, iterar rápido** — MVP acotado; lo que queda fuera está listado con versión asignada.

Desarrollados en [docs/producto/vision.md](docs/producto/vision.md).

## Estado

En desarrollo, v1 sin publicar. Lo que hay hoy es el andamiaje: proyecto, calidad, despliegue
continuo y los design tokens. El registro diario, la persistencia y la sincronización están
decididos y documentados, no construidos.

El trabajo se lleva en un tablero de Histos aparte; las decisiones ya firmadas se reflejan en
[`docs/`](docs/README.md).

## Desarrollo

Requiere Node 24 (ver `.nvmrc`).

```bash
npm install
```

```bash
npm run dev
```

| Script       | Qué hace                                    |
| ------------ | ------------------------------------------- |
| `dev`        | Servidor de desarrollo                      |
| `build`      | Comprobación de tipos y build de producción |
| `preview`    | Sirve el build, con el `base` real de Pages |
| `test`       | Vitest, una pasada                          |
| `test:watch` | Vitest en modo continuo                     |
| `lint`       | ESLint                                      |
| `typecheck`  | TypeScript sin emitir                       |
| `format`     | Prettier sobre todo el proyecto             |

## Estructura

```
src/
  app/            Entrada, layout raíz
  features/       Una carpeta por área: entry, schema, history, charts, theme, sync
  data/           IndexedDB, repositorios, tipos del modelo
  ui/             Primitivas de interfaz
  styles/         Design tokens y CSS global
  lib/            Utilidades sin dominio (fechas, formato)
docs/             Decisiones aprobadas, ver docs/README.md
scripts/          Utilidades de mantenimiento
```

Dos reglas de dependencia, verificadas por ESLint y no por buena voluntad: una feature no importa
de otra feature, y `data/` no importa de `features/` ni de `ui/`. Detalle en
[docs/tecnica/stack.md](docs/tecnica/stack.md).

## Contribuir

`main` está protegida: el trabajo va en ramas `tipo/id-tarjeta` y entra por pull request con el
check de `ci` en verde.

Los mensajes de commit siguen Conventional Commits, con el id de la tarjeta del tablero como
scope:

```
feat(entrada): registrar hábitos booleanos con un tap
```

Así el historial y el tablero se navegan el uno desde el otro: `git log --grep "(entrada)"`.

## Privacidad

Los datos del usuario —hábitos registrados y estado de ánimo diario— **no viven en este
repositorio**. Se almacenan localmente en IndexedDB y se sincronizan contra un repo privado y
separado, propiedad del usuario. Aquí sólo hay código: ningún fixture, captura o test incluye
datos reales, y los de ejemplo se generan sintéticos.

## Licencia

MIT — ver [LICENSE](LICENSE).
