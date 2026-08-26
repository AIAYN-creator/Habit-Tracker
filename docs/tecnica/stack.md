# Stack y estructura del proyecto

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Build | Vite (última estable) | Arranque instantáneo, plugin de PWA maduro, cero configuración para empezar |
| UI | React 19 + TypeScript en modo estricto | Ecosistema de las librerías que ya están decididas (Framer Motion, visx/Recharts, hooks de Dexie) |
| Router | React Router en modo declarativo | Cuatro vistas y poco más; no hace falta un framework de rutas con carga de datos |
| Estado de UI | Zustand | El estado *de datos* vive en IndexedDB y llega por `useLiveQuery`; lo global es poco |
| Estado de datos | `dexie-react-hooks` | La UI se resuscribe sola a la base de datos, sin capa de caché intermedia |
| Lint y formato | ESLint + Prettier | Se configuran en `tooling`; aquí sólo se reservan los scripts |

### Por qué no hay librería de componentes

Nada de MUI, Chakra o shadcn. El diferenciador declarado en `vision` es la GUI y la
customización: partir de un sistema de componentes ajeno significa pelearse con sus tokens para
imponer los tuyos, y acabar escribiendo más CSS de sobreescritura del que costaba el componente.
`ui-kit` construye las pocas primitivas necesarias sobre los tokens de `tokens`.

### Por qué Zustand y no Context

Casi todo el estado interesante es una consulta a IndexedDB, y `useLiveQuery` ya se encarga de
mantenerlo fresco. Lo que queda —tema activo, día seleccionado, estado de la sincronización— son
tres o cuatro átomos. Context con eso provoca re-renders de todo el árbol al cambiar un color;
Zustand permite suscribirse por selector y cuesta alrededor de 1 kB.

## Estructura de carpetas

Por feature, no por tipo de fichero. Con 40 tarjetas por delante, un `components/` plano se
convierte en un cajón de sastre hacia la tarjeta número diez.

```
src/
  app/            # Entrada, router, providers, layout raíz
  features/
    entry/        # Registro diario
    schema/       # CRUD de hábitos y dimensiones de mood
    history/      # Calendario y lista
    charts/       # Heatmap, series, barras
    theme/        # Panel de customización
    sync/         # Auth de GitHub, motor de sync, estado
  data/           # Dexie, repositorios, migraciones, tipos del modelo
  ui/             # Primitivas del ui-kit
  styles/         # Tokens y CSS global
  lib/            # Utilidades sin dependencias de dominio (fechas, formato)
```

Regla de dependencias, que ESLint hará cumplir en `tooling`:

- `features/*` puede importar de `data`, `ui`, `lib` y `styles`.
- **Una feature no importa de otra feature.** Lo que necesiten dos, sube a `ui` o a `lib`.
- `data` no importa de `features` ni de `ui`. Es la capa de abajo.

## Alias

`@/` apunta a `src/`, declarado a la vez en `vite.config.ts` y en `tsconfig.json`. Nada de
`../../../`.

## TypeScript

`strict: true` de salida, más `noUncheckedIndexedAccess`. Esto último es especialmente relevante
aquí: el modelo de `modelo` se apoya en que la ausencia de una clave significa "no registrado", y
sin esa opción TypeScript te deja tratar `entry.habits["h_run"]` como si siempre existiera, que
es exactamente el bug que produce heatmaps mentirosos.

## Scripts

```
dev        vite
build      tsc --noEmit && vite build
preview    vite preview
test       vitest
lint       eslint .
format     prettier --write .
typecheck  tsc --noEmit
```

## Base path del despliegue

El despliegue de `ci` es a GitHub Pages como *project site*, así que la app se sirve bajo
`/Habit-Tracker/`, no en la raíz del dominio. Hay que fijar `base: '/Habit-Tracker/'` en
`vite.config.ts`, y que router y manifest de la PWA respeten ese prefijo.

Se documenta aquí porque es el fallo clásico de este despliegue: en local funciona todo y en
producción sale la pantalla en blanco con 404 en los assets. Si algún día hay dominio propio,
esto vuelve a `'/'`.

## Criterios de aceptación

- [ ] `npm run dev` levanta la app con una pantalla mínima.
- [ ] `npm run build` y `npm run typecheck` pasan en limpio.
- [ ] El alias `@/` resuelve en el editor y en el build.
- [ ] El árbol de `src/` existe con las carpetas de arriba, aunque estén casi vacías.
- [ ] `base` configurado y verificado con `npm run preview`.
