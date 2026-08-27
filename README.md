<p align="center">
  <img src="brand/logo.svg" alt="" width="96" height="96" />
</p>

<h1 align="center">Track Your Way</h1>

<p align="center">
  <em>Hábitos y estado de ánimo, a tu manera.</em>
</p>

[![ci](https://github.com/AIAYN-creator/Habit-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/AIAYN-creator/Habit-Tracker/actions/workflows/ci.yml)

**Track Your Way** es un tracker de hábitos y estado de ánimo **local-first**, instalable como PWA, que guarda los datos en
el dispositivo y los sincroniza contra un repositorio privado de GitHub del propio usuario. Sin
servidor, sin base de datos gestionada, sin cuenta que crear.

**En vivo:** <https://aiayn-creator.github.io/Habit-Tracker/>

> Captura pendiente: se añade cuando haya interfaz de verdad.

## Marca

El símbolo es la retícula del heatmap con la diagonal de días cumplidos encendida. Vive en
[`brand/`](brand/) y de ahí salen todos los derivados —favicon, iconos de instalación e imagen de
preview— con un solo comando:

```bash
npm run icons
```

El nombre juega con las dos cosas que definen el proyecto: registrar, y hacerlo a tu manera. El
símbolo se mantiene como marca provisional hasta que merezca una pasada de diseño en condiciones;
la cañería ya está montada, así que rehacer el SVG maestro y ejecutar el comando regenera todo.
Ver [diseno/logo.md](docs/diseno/logo.md).

Los colores de marca son tokens propios, separados de los del tema: el usuario puede cambiar la
paleta entera de la app y la marca no se va con ella.

## Principios

- **Local-first** — funciona al 100% sin red; la sincronización es una capa añadida, nunca una dependencia.
- **Schema-driven** — los hábitos y las dimensiones de mood se definen como datos, no se hardcodean.
- **Customización real** — paleta, tipografía, densidad y tipo de visualización son configurables en runtime.
- **Empezar simple, iterar rápido** — MVP acotado; lo que queda fuera está listado con versión asignada.

Desarrollados en [docs/producto/vision.md](docs/producto/vision.md).

## Documentación

- **[GUIA.md](GUIA.md)** — cómo usarla: token, sincronización, recuperar datos.
- **[QA.md](QA.md)** — los veinte escenarios de prueba y los criterios de salida de v1.
- **[docs/](docs/README.md)** — las 41 decisiones aprobadas del tablero.

## Estado

En desarrollo, v1 sin publicar. Lo que hay hoy es el andamiaje: proyecto, calidad, despliegue
continuo y los design tokens. El registro diario, la persistencia y la sincronización están
decididos y documentados, no construidos.

El trabajo se lleva en un tablero de Histos aparte; las decisiones ya firmadas se reflejan en
[`docs/`](docs/README.md).

## Hoja de ruta

Las 41 decisiones de v1 y v1.5 están cerradas y firmadas en [`docs/`](docs/README.md). Lo de v2 y
v3 es intención, no compromiso: no tiene tarjetas ni decisiones tomadas.

### v1 — en construcción

Registro diario, CRUD de hábitos y moods, heatmap, series y barras, historial en calendario y
lista, customización completa de apariencia, sincronización con GitHub y funcionamiento offline.

**Modo claro y oscuro ya entran aquí**, no más tarde: están en los design tokens desde el primer
día, con conmutador manual y seguimiento del sistema.

### v1.5 — fuera del scope de la v1 pero prevista para finales de septiembre

Tablero configurable con widgets reordenables. Ver
[producto/dashboard.md](docs/producto/dashboard.md).

### v2 — la app fuera del navegador

- **Empaquetado de escritorio**, previsiblemente con Tauri antes que Electron: unos pocos MB
  frente a más de cien, y acceso al almacén de credenciales del sistema, que es la respuesta real
  al riesgo de guardar el token en un navegador.
- **Correlaciones entre métricas.** Superponer un hábito y una dimensión de ánimo en la misma
  gráfica —gimnasio contra ánimo social, leer contra ánimo académico— para ver si hay relación.
  `vision` lo dejó fuera de v1 por una razón que sigue en pie: necesita meses de datos reales
  para decir algo, y antes de tenerlos no hay criterio para saber qué correlación merece la pena
  mostrar. Con un año de uso, sí.
- **Interfaz en español e inglés.** Hoy los textos están escritos directamente en el código; hace
  falta extraerlos y añadir una capa de traducción. Las fechas ya salen de `Intl`, así que esa
  parte está resuelta de nacimiento.

### v3 — multiusuario

Migrar de GitHub como almacén a una base de datos con autenticación propia. El modelo
schema-driven está pensado para que sea mecánico —los datos ya son JSON con identificadores
estables y sin `userId` implícito— pero exige servidor, y con él todo lo que v1 evita a propósito:
cuentas, permisos, recuperación y coste de operación.

Es un cambio de naturaleza del proyecto, no una versión más.

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
