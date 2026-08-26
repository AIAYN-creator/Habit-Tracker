# Habit Tracker

Tracker de hábitos y estado de ánimo **local-first**, instalable como PWA, que guarda los datos
en el dispositivo y los sincroniza contra un repositorio privado de GitHub del propio usuario.
Sin servidor, sin base de datos gestionada, sin cuenta que crear.

> Captura pendiente: se añade cuando haya UI.

## Principios

- **Local-first** — funciona al 100% sin red; la sincronización es una capa añadida, nunca una dependencia.
- **Schema-driven** — los hábitos y las dimensiones de mood se definen como datos, no se hardcodean.
- **Customización real** — paleta, tipografía, densidad y tipo de visualización son configurables en runtime.
- **Empezar simple, iterar rápido** — MVP acotado; lo que queda fuera está listado con versión asignada.

## Estado

En desarrollo. v1 sin publicar. El tablero de trabajo se lleva aparte, en un vault de
[Histos](https://github.com/AIAYN-creator).

## Desarrollo local

Requiere Node 24 (ver `.nvmrc`).

```bash
npm install
npm run dev
```

```bash
npm run build
```

El scaffold del proyecto todavía no está en el repo: llega con la tarjeta `stack`.

## Privacidad

Los datos del usuario —hábitos registrados y estado de ánimo diario— **no viven en este
repositorio**. Se almacenan localmente en IndexedDB y se sincronizan contra un repo privado y
separado, propiedad del usuario. Este repositorio contiene únicamente código: ningún fixture,
captura o test incluye datos reales, y los datos de ejemplo se generan sintéticos.

## Licencia

MIT — ver [LICENSE](LICENSE).
