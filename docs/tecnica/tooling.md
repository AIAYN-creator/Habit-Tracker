---
description: ESLint, Prettier, Vitest y hook de pre-commit.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Tooling de calidad

Con un solo desarrollador, el tooling no está para arbitrar discusiones de estilo: está para que
los errores que se cometen a las once de la noche no lleguen a `main`.

## ESLint

Configuración plana (`eslint.config.js`), con:

- `typescript-eslint` en modo `strictTypeChecked`. Sí, es ruidoso; también es lo que detecta el
  `await` olvidado en una escritura a IndexedDB.
- `eslint-plugin-react-hooks` — con Dexie y `useLiveQuery`, un array de dependencias mal puesto
  se manifiesta como "la UI no se actualiza a veces", que es de los bugs más caros de perseguir.
- `eslint-plugin-jsx-a11y` — barato, y `a11y` más adelante agradecerá no partir de cero.

### La regla que de verdad importa

La frontera entre features que `stack` declaró, hecha cumplir con `import/no-restricted-paths`:

```
src/features/entry/**   no puede importar de  src/features/*/  (salvo la propia)
src/data/**             no puede importar de  src/features/**  ni  src/ui/**
```

Sin esto, la regla es una intención escrita en un documento; con esto, es un error de lint. Es la
única regla de arquitectura que se automatiza, y merece la pena porque es la que se rompe sola
cuando tienes prisa.

## Prettier

Sin discusión ni configuración creativa: `printWidth: 100`, comillas simples, punto y coma, y
`eslint-config-prettier` al final de la cadena para que ESLint no opine de formato. Formatear no
es una decisión de diseño.

## Vitest

Entorno `jsdom` con `@testing-library/react` y `@testing-library/user-event`.

### Qué se prueba y qué no

Sin cobertura mínima obligatoria: en un proyecto de una persona, un umbral de cobertura sólo
produce tests escritos para el contador. En su lugar, tres zonas donde los tests **sí** son
obligatorios porque un fallo es silencioso y caro:

1. **Lógica de fechas.** El día local frente a UTC que fija `modelo`, los límites de mes y los
   cambios de horario. Un fallo aquí desplaza datos y no lo notas hasta meses después.
2. **Serialización.** Ida y vuelta entre el modelo local y los JSON del repo: `parse(serialize(x))`
   debe devolver `x`. Es la garantía de que la sincronización no corrompe datos.
3. **Compatibilidad de schema.** La tabla de `modelo` sobre qué cambios son compatibles, traducida
   a tests. Es la red que impide romper el histórico.

Lo que **no** se prueba: componentes por captura de pantalla (snapshots), estilos, y cualquier
cosa cuyo test haya que reescribir cada vez que se mueve un `div`.

## Pre-commit

`husky` con `lint-staged`: sobre los ficheros en el índice, Prettier y ESLint con `--max-warnings 0`.

El `typecheck` y los tests **no** van en pre-commit: tardan lo suficiente como para que acabes
usando `--no-verify` por costumbre, que es peor que no tener hook. Van en CI, que es donde
bloquean de verdad.

## commitlint

`@commitlint/config-conventional` para validar el formato que fijó `repo`. Sólo el formato: no se
valida el scope contra la lista de ids del tablero. Mantener sincronizados cuarenta y un ids en
un fichero de configuración es trabajo recurrente para atrapar erratas que no hacen daño.

## Editor

`.vscode/extensions.json` recomendando ESLint y Prettier, y `settings.json` con formateo al
guardar. Se versiona: no es imponer editor, es que la configuración del proyecto viaje con el
proyecto.

## Criterios de aceptación

- [ ] `npm run lint` pasa en limpio sobre el scaffold de `stack`.
- [ ] Un import de una feature a otra **falla** el lint. Verificado a mano.
- [ ] Un import de `data` a `ui` **falla** el lint. Verificado a mano.
- [ ] `npm run test` arranca y ejecuta al menos un test de ejemplo.
- [ ] Un commit con mensaje mal formado es rechazado.
- [ ] El hook de pre-commit tarda menos de cinco segundos en un cambio de un fichero.
