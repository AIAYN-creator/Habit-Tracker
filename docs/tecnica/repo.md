---
description: 'Inicializar el repositorio: licencia, README inicial, .gitignore y convención
  de commits.'
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Repo, licencia y convenciones

## Repositorio

- **Código:** https://github.com/AIAYN-creator/Habit-Tracker
- **Visibilidad actual:** público
- **Estado actual:** vacío (sin commits, sin rama por defecto, sin licencia)

### Dos repos, no uno

Conviene fijarlo desde el principio para que no se mezcle nunca:

| Repo | Qué contiene | Visibilidad |
|---|---|---|
| `Habit-Tracker` | El código de la PWA | Público |
| Repo de datos (aún sin crear) | `schemas/*.json` y `entries/*.json` del usuario | **Privado, obligatoriamente** |

Los datos son un registro diario de hábitos y estado de ánimo: son datos personales sensibles y
no comparten repositorio con el código bajo ninguna circunstancia. La estructura concreta del
repo de datos se decide en `adr-repo`; aquí solo se fija la separación.

Consecuencia práctica para el desarrollo: ningún fixture, captura ni test puede llevar datos
reales. Los datos de ejemplo se generan sintéticos en `seed`.

## Licencia

Un repo público sin fichero de licencia es, legalmente, "todos los derechos reservados": nadie
puede usarlo ni forkearlo aunque lo esté viendo. Hay que elegir explícitamente.

**Propuesta: MIT.** Es lo estándar para una app personal que además sirve de escaparate, no
impone obligaciones a quien la use y no complica nada. La alternativa razonable es AGPL-3.0 si
en algún momento importa que un tercero no pueda montar una versión hospedada cerrada — pero
dado que el modelo es local-first y sin servidor, ese riesgo es casi teórico.

Si la preferencia es que el código sea visible pero no reutilizable, la opción honesta es dejarlo
sin licencia y decirlo en el README, no elegir una licencia permisiva por inercia.

**Esta elección se confirma al aprobar esta carta.**

## Ficheros iniciales

- `LICENSE` — la licencia elegida.
- `README.md` — ver esquema abajo.
- `.gitignore` — plantilla de Node más lo específico de Vite: `node_modules/`, `dist/`,
  `dist-ssr/`, `.vite/`, `coverage/`, `*.local`, `.env*` salvo `.env.example`, `.DS_Store`,
  y directorios de editor (`.vscode/` con excepción de `extensions.json`, `.idea/`).
- `.editorconfig` — UTF-8, LF, indentación de 2 espacios, nueva línea final.
- `.nvmrc` — versión de Node fijada, para que CI y local no diverjan.

Importante en Windows: fijar `core.autocrlf=false` y forzar LF vía `.gitattributes`
(`* text=auto eol=lf`). Si no, el primer commit desde otra máquina reescribe medio repo por
finales de línea y el `diff` deja de servir para nada.

## README inicial

Mínimo viable, se amplía en `docs`:

1. Qué es en una frase y una captura (pendiente hasta que haya UI).
2. Los cuatro principios en formato lista corta.
3. Estado del proyecto: en desarrollo, v1 sin publicar.
4. Cómo arrancar en local: requisitos, instalación, `dev`, `build`.
5. Nota de privacidad: los datos del usuario viven en su propio repo privado, este repo no
   contiene ni recibe datos personales.
6. Licencia.

## Convención de commits

**Conventional Commits**, con un giro: el scope es el id de la carta de Histos.

```
<tipo>(<id-carta>): <descripción en imperativo>
```

Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `build`, `ci`.

Ejemplos:

```
feat(entrada): registrar hábitos booleanos con un tap
fix(sync): reintentar push tras 409 en vez de descartar el cambio
chore(repo): añadir .editorconfig y .nvmrc
docs(vision): fijar criterios de éxito de v1
```

El motivo de atar el scope al id de la carta es que el historial de git y el tablero queden
navegables el uno desde el otro: `git log --grep "(sync)"` devuelve todo lo que se hizo para esa
carta, sin necesidad de ninguna herramienta extra. Es también la razón por la que los ids se
mantuvieron cortos.

## Ramas

Trunk-based, que es lo sensato para un único desarrollador:

- `main` siempre desplegable.
- Ramas cortas `tipo/id-carta` (por ejemplo `feat/heatmap`) para trabajo de más de una sesión,
  fusionadas con squash.
- Commits directos a `main` aceptables para cambios triviales mientras no haya CI. En cuanto
  `ci` esté en verde, `main` se protege exigiendo que el check pase.

## Versionado

`0.x` durante todo el desarrollo de v1. Tag `v1.0.0` al cerrar `qa`. Sin changelog automático
por ahora: con un solo desarrollador, el `git log` con scopes de carta ya cumple esa función.

## Criterios de aceptación

- [ ] `main` existe como rama por defecto con un commit inicial.
- [ ] `LICENSE` presente y coherente con lo decidido arriba.
- [ ] `README.md` cubre los seis puntos del esquema.
- [ ] `.gitignore`, `.editorconfig`, `.gitattributes` y `.nvmrc` presentes.
- [ ] `git status` limpio tras un `npm install` (una vez exista `stack`).
- [ ] Al menos un commit siguiendo la convención, como referencia viva.
