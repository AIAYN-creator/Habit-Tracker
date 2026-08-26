---
description: Diferenciador (GUI y customización), principios local-first y schema-driven,
  y qué queda fuera de v1.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Visión, principios y alcance

## Qué es

Un tracker de hábitos y estado de ánimo **local-first**, instalable como PWA, que guarda los
datos en el dispositivo y los sincroniza contra un repositorio privado de GitHub del propio
usuario. No hay servidor propio, no hay base de datos gestionada, no hay cuenta que crear.

## Diferenciador central

**La GUI y la customización son el producto.** Sin eso, esto es un Excel con más pasos.

Cualquiera puede almacenar un booleano por día en una hoja de cálculo. Lo que justifica que
esto exista es que registrar el día sea rápido y agradable, que la visualización se adapte al
tipo de dato que estás midiendo, y que el usuario pueda cambiar paleta, tipografía, densidad y
forma de visualizar cada métrica sin tocar código. Toda decisión de producto se evalúa contra
esa vara: si no mejora la experiencia de registro o la capacidad de personalización, no entra
en v1.

## Principios

1. **Local-first.** La app funciona al 100% sin red. IndexedDB es la fuente de verdad del
   dispositivo; la sincronización es una capa añadida, nunca una dependencia. Si GitHub está
   caído, o el token ha caducado, o no hay cobertura, la app sigue siendo plenamente usable.

2. **Schema-driven.** Los hábitos y las dimensiones de mood se definen como datos, no se
   hardcodean. Añadir un hábito nuevo es escribir una entrada en un JSON desde la UI, no tocar
   un componente. Esto es también lo que hace que una futura migración a un backend con base de
   datos sea mecánica en lugar de una reescritura.

3. **Customización real.** Colores, tipografía, densidad, tipo de visualización por métrica y
   (a partir de v1.5) layout del dashboard son configurables por el usuario en runtime, no
   constantes en el código.

4. **Empezar simple, iterar rápido.** El MVP está acotado y lo que queda fuera está listado
   explícitamente más abajo, con versión asignada. Nada se queda en "ya veremos".

## Usuario

v1 tiene **un único usuario: Martí**. No hay multi-tenant, no hay onboarding de terceros, no
hay recuperación de cuenta. Esto es una decisión, no una carencia: elimina toda la superficie de
auth, permisos y aislamiento de datos, y es lo que permite usar GitHub como backend.

El modelo de datos, sin embargo, no asume un único usuario en su forma — ver "Horizonte".

## Alcance de v1 (MVP)

- CRUD de campos custom: definir y editar el schema de hábitos y de moods desde la UI.
- Registro de entrada diaria (hábitos + mood) con interacción rápida y feedback visual inmediato.
- Visualización adaptada al tipo de dato: heatmap tipo contributions para booleanos, línea suave
  para escalas, barras para contadores y duraciones.
- Historial navegable en calendario y en lista, con edición de entradas pasadas.
- Theming completo: paleta por hábito o categoría, tipografía y densidad de UI.
- Auth con GitHub por token y sincronización manual o automática.
- Funcionamiento offline con sincronización al recuperar la red.

## Alcance de v1.5

- Dashboard configurable con drag & drop de widgets y gráficas, al estilo de un mini Notion.

Va después de v1 y no antes porque depende de que las visualizaciones individuales estén
cerradas: componer un dashboard con piezas que aún cambian de forma es trabajo que se tira.

## Fuera de alcance ahora

| Qué | Por qué se queda fuera |
|---|---|
| Analytics avanzados (correlaciones hábito ↔ mood) | Necesita meses de datos reales para que diga algo. Antes de v1 no hay ni datos ni criterio para saber qué correlación merece la pena mostrar. |
| Multi-tenant / multiusuario público | Incompatible con GitHub-as-backend sin fricción: cada usuario necesitaría su propio token y su propio repo. |
| Notificaciones y recordatorios | Superficie propia (permisos, service worker, horarios) que no toca el diferenciador. |
| Auth propia con base de datos | Solo tiene sentido si se llega a multi-tenant real. |

## Horizonte v2/v3

Multi-tenant real exigiría migrar de GitHub-as-backend a una base de datos con auth propia. El
modelo schema-driven está pensado precisamente para que esa migración sea mecánica: los schemas
y las entradas ya son datos serializables con IDs estables, así que cambia la capa de
persistencia y de auth, no el modelo ni la UI.

## Limitación conocida y aceptada

GitHub como backend no escala a un producto público. Es válido para uso personal o para un
círculo reducido de gente técnica que sepa generar un token y crear un repo privado. Se asume
con los ojos abiertos: es el precio de no tener servidor, y a cambio los datos son del usuario,
en texto plano versionado, sin intermediario.

## Decisiones abiertas

Cada una tiene su propia carta y debe cerrarse antes de que bloquee implementación:

- **D3/visx vs Recharts** — control visual pixel a pixel frente a velocidad de desarrollo. → `charts`
- **Estructura del repo de datos** — carpetas por año, naming, un repo o varios. → `adr-repo`
- **Resolución de conflictos** — last-write-wins por timestamp en v1; revisar si el uso real
  desde varios dispositivos genera conflictos de verdad. → `adr-sync`

## Criterios de éxito de v1

1. Registrar el día completo lleva menos de 30 segundos desde abrir la app.
2. La app arranca y es plenamente usable en modo avión, incluido el historial.
3. Añadir un hábito nuevo de un tipo ya soportado no requiere tocar código.
4. Cambiar la paleta y la densidad se refleja en toda la UI, gráficas incluidas.
5. Tras un mes de uso real, los datos del repo de GitHub reconstruyen el estado completo en un
   dispositivo nuevo.
