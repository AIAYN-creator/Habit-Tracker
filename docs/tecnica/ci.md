---
description: 'GitHub Actions: lint, test y build; despliegue de la PWA a GitHub Pages.'
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# CI y despliegue

Dos flujos de trabajo separados, porque tienen disparadores y permisos distintos y mezclarlos
obliga a dar permisos de escritura a un trabajo que sólo debería mirar.

Al ser el repo público, los minutos de Actions son gratis e ilimitados. No hay presupuesto que
optimizar.

## `ci.yml` — verificación

Se dispara en cada `push` a `main` y en cada pull request.

```yaml
node-version-file: .nvmrc
cache: npm
```

Pasos: `npm ci`, `lint`, `typecheck`, `test`, `build`. En ese orden, porque es el orden de coste
creciente: que falle el lint en veinte segundos es mejor que enterarse tras el build.

El `build` está en CI aunque el despliegue lo repita: un error de compilación en una rama que
nunca se despliega debe salir igual.

`.nvmrc` como fuente de la versión de Node, no un número escrito en el YAML. Un solo sitio donde
cambiarlo, que es lo que `stack` fijó.

## `deploy.yml` — GitHub Pages

Se dispara en `push` a `main` y a mano (`workflow_dispatch`).

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
```

Build, `actions/upload-pages-artifact` sobre `dist/`, y `actions/deploy-pages`. Sin tokens ni
secretos: el despliegue de Pages usa OIDC, y este proyecto **no tiene ni un secreto que
configurar**. El PAT del usuario vive en su navegador, nunca en el repositorio.

`cancel-in-progress` porque dos despliegues seguidos no deben pelearse; el último gana, que es lo
que uno espera.

## Lo que hay que configurar a mano

Estas dos cosas no van en el YAML y se olvidan siempre:

1. **Ajustes → Pages → Source: GitHub Actions.** Sin esto, el flujo de despliegue termina en
   verde y no publica nada.
2. **Protección de `main`** exigiendo que `ci` pase. Con un solo desarrollador puede parecer
   ceremonia, pero es exactamente la barrera que impide subir a producción algo que no compila un
   viernes a las once.

## SPA en Pages y las rutas profundas

Pages sirve ficheros estáticos: al recargar en `/Habit-Tracker/historial`, busca ese fichero y
devuelve 404. El apaño estándar es copiar `index.html` como `404.html` en el build; Pages sirve
esa página y el router recoge la ruta.

Se hace como paso del build, no a mano. Y conviene comprobarlo el primer día: con el `base` que
fijó `stack`, es el segundo fallo clásico de este despliegue.

## Lo que no entra

Sin despliegues de vista previa por pull request, sin release automática, sin changelog generado,
sin análisis de bundle en cada commit. Todo eso son flujos que mantener a cambio de poco en un
proyecto de una persona. Si algún día molesta no tenerlos, se añaden entonces.

## Criterios de aceptación

- [ ] `ci` pasa en verde sobre `main`.
- [ ] Un commit que rompe el tipado hace fallar `ci`.
- [ ] La app está publicada y accesible en la URL de Pages del proyecto.
- [ ] Recargar en una ruta profunda no da 404.
- [ ] La app instalada desde esa URL abre en su `start_url` correcto.
- [ ] `main` está protegida exigiendo `ci`.
