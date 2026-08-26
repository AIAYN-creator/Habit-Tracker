# Decisiones

Espejo de las tarjetas **aprobadas** del tablero de Histos con el que se lleva este proyecto.
Cada fichero es una decisión cerrada y firmada, no un borrador. El nombre de cada fichero es el id
de su tarjeta, que es también el scope de los commits relacionados: `git log --grep "(dexie)"`.

## Decisiones de arquitectura

| Documento | Qué fija |
|---|---|
| [adr/charts.md](adr/charts.md) | Librería de gráficas y contrato de customización |
| [adr/adr-repo.md](adr/adr-repo.md) | Estructura del repo privado de datos |
| [adr/adr-sync.md](adr/adr-sync.md) | Sincronización: fusión a tres bandas y conflictos |

## Producto

| Documento | Qué fija |
|---|---|
| [producto/vision.md](producto/vision.md) | Diferenciador, principios, alcance de v1 y qué queda fuera |
| [producto/modelo.md](producto/modelo.md) | Modelo de datos schema-driven: hábitos, moods y entradas |
| [producto/flujos.md](producto/flujos.md) | Navegación y los cinco flujos de uso, estados no felices incluidos |
| [producto/habitos.md](producto/habitos.md) | CRUD de hábitos: tipos, frecuencia, archivado y reordenación |
| [producto/moods.md](producto/moods.md) | CRUD de dimensiones de mood: escalas, tags y notas |
| [producto/entrada.md](producto/entrada.md) | La pantalla de registro diario, reutilizada por el historial |
| [producto/calendario.md](producto/calendario.md) | Historial en calendario: anillo de completitud y navegación |
| [producto/lista.md](producto/lista.md) | Historial en lista: resumen por día, paginación y filtro |

## Técnica

| Documento | Qué fija |
|---|---|
| [tecnica/repo.md](tecnica/repo.md) | Licencia, convención de commits y separación código/datos |
| [tecnica/stack.md](tecnica/stack.md) | Stack, estructura de carpetas y reglas de dependencia |
| [tecnica/tooling.md](tecnica/tooling.md) | ESLint, Prettier, Vitest, pre-commit y qué se prueba |
| [tecnica/ci.md](tecnica/ci.md) | Verificación y despliegue a GitHub Pages |
| [tecnica/pwa.md](tecnica/pwa.md) | Manifest, caché, actualizaciones y el borrado de datos en iOS |
| [tecnica/dexie.md](tecnica/dexie.md) | Tablas de IndexedDB, claves, transacciones y migraciones |
| [tecnica/dal.md](tecnica/dal.md) | Capa de acceso a datos: superficie, atomicidad y fechas |
| [tecnica/validacion.md](tecnica/validacion.md) | Validación con zod y aplicabilidad de cambios de schema |
| [tecnica/serialize.md](tecnica/serialize.md) | Serialización a los ficheros del repo y codificación |
| [tecnica/auth-gh.md](tecnica/auth-gh.md) | Token de GitHub: alcance, almacenamiento y caducidad |
| [tecnica/seed.md](tecnica/seed.md) | Fixtures deterministas de desarrollo y casos límite |
| [tecnica/sync.md](tecnica/sync.md) | Motor de sincronización: ciclo, cerrojo y pruebas |
| [tecnica/cola.md](tecnica/cola.md) | Cola offline: rutas, deduplicación y reintentos |
| [tecnica/estado-sync.md](tecnica/estado-sync.md) | Qué se enseña del estado de sincronización, y con cuánta insistencia |

## Diseño

| Documento | Qué fija |
|---|---|
| [diseno/tokens.md](diseno/tokens.md) | Design tokens: color, tipografía, espaciado, densidad |
| [diseno/ui-kit.md](diseno/ui-kit.md) | Las catorce primitivas y la línea base de accesibilidad |
| [diseno/panel-tema.md](diseno/panel-tema.md) | El panel donde el usuario ejerce la customización |
| [diseno/logo.md](diseno/logo.md) | Identidad, tokens de marca y entregables de icono |
| [diseno/iconos.md](diseno/iconos.md) | Set de iconos e ilustraciones de estados vacíos |
| [diseno/splash.md](diseno/splash.md) | Generación y verificación de los assets de PWA |
| [diseno/a11y.md](diseno/a11y.md) | Accesibilidad, contraste y qué pasa con los colores del usuario |
| [diseno/inputs.md](diseno/inputs.md) | Controles por tipo de dato y los tres estados de un registro |
| [diseno/micro.md](diseno/micro.md) | Micro-interacciones: dónde animar, dónde no y con qué duración |
| [diseno/pulido.md](diseno/pulido.md) | Pase de pulido: matriz de estados, cifras tabulares y áreas seguras |

## Gráficas

| Documento | Qué fija |
|---|---|
| [graficas/heatmap.md](graficas/heatmap.md) | Retícula de contribuciones y la capa compartida de gráficas |
| [graficas/series.md](graficas/series.md) | Línea para escalas: eje fijo, huecos y curva |
| [graficas/barras.md](graficas/barras.md) | Barras para contadores: agrupación, objetivo y formato |

## Sobre la fuente de verdad

El tablero de Histos es el canon: aquí sólo se copia lo ya aprobado, para que quien lea el código
tenga las decisiones al lado sin depender del vault. Si un documento y el código se contradicen,
gana el documento; si un documento y el tablero se contradicen, gana el tablero y este espejo está
desactualizado.

Estos ficheros **no se editan a mano**. Un cambio de decisión se propone y se aprueba en el
tablero, y de ahí baja aquí con:

```bash
node scripts/sync-docs.mjs --vault "../Habit tracker"
```

## Deuda anotada

Ninguna. Las tres que había —la tabla `syncBase` de `dexie`, el `settings.json` de `adr-repo` y el
bloque `display` de `modelo`— se propusieron y se aprobaron, y están incorporadas a sus documentos.

## Decisiones abiertas

- **Nombre de la app.** "Habit Tracker" describe la categoría, no el producto. Bloquea el
  logotipo, no el código. Ver [diseno/logo.md](diseno/logo.md).
- **Historial de borrados en el repo de datos.** Borrar una entrada no la borra del historial de
  Git. Ver [adr/adr-repo.md](adr/adr-repo.md).
