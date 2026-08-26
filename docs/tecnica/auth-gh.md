---
description: Personal Access Token de grano fino acotado al repo de datos; el device
  flow queda descartado por CORS.
sources: []
estimated_duration_hours: null
actual_duration_hours: null
assigned_to: agent
status_note: null
---
# Auth con GitHub

Token de acceso personal de grano fino. El device flow queda descartado: su endpoint de canje no
envía cabeceras CORS, así que un cliente estático no puede usarlo sin un servidor intermedio, que
es justo lo que esta arquitectura evita.

## El token

Un **fine-grained PAT**, acotado a lo mínimo:

- Repositorio: **sólo** `habit-tracker-data`. Ni "todos", ni la cuenta entera.
- Permiso: **Contents → Read and write**. Uno solo.
- Caducidad: hasta un año.

**Un token por dispositivo.** Si se pierde el móvil, se revoca ese y los demás siguen. Un token
compartido entre tres dispositivos obliga a reconfigurarlos todos para expulsar a uno.

## Conexión, paso a paso

Es el punto de más fricción de la app y el que más gente abandona, así que la pantalla guía en
lugar de presentar un campo vacío:

1. Enlace directo a la pantalla de creación de tokens de GitHub, ya filtrada al tipo correcto.
2. Instrucciones literales de qué marcar: el repositorio y el permiso, con captura.
3. Campo para pegar el token.
4. Verificación inmediata: una llamada de lectura al repo. Si funciona, se guarda; si no, se dice
   exactamente qué falló —token inválido, repo inaccesible o permiso insuficiente son tres errores
   distintos y tres arreglos distintos.

Sin token, la app funciona entera en local. La conexión se ofrece, no se impone, y no aparece en
el primer arranque: `flujos` la deja para cuando ya hay algo que perder.

## Dónde vive el token

En la tabla `settings` de IndexedDB. Y conviene ser honesto sobre lo que eso significa: **no es
más seguro que `localStorage` frente a un XSS**. Cualquier script inyectado en el origen puede
leer ambos. Se usa IndexedDB por coherencia con el resto del estado, no por seguridad.

La protección real es que no haya XSS:

- `Content-Security-Policy` estricta, sin `unsafe-inline` ni `unsafe-eval`.
- Cero scripts de terceros en tiempo de ejecución. Ni analítica, ni fuentes remotas, ni CDNs.
- El token no se escribe nunca en un log, ni en una URL, ni en un mensaje de error.

Y una consecuencia que hay que aceptar con los ojos abiertos: un token con permiso de escritura
viviendo en un navegador es asumible para una app personal servida desde tu propio dominio, y es
exactamente la razón por la que esto no puede ser un producto público sin backend. Ya está dicho
en `vision`; aquí es donde se materializa.

## Caducidad

Las respuestas de la API traen la fecha de expiración del token en una cabecera cuando se trata de
un PAT. Si está presente, se guarda y se avisa con dos semanas de antelación; si no, se detecta el
401 cuando llega y se pide renovar.

En cualquiera de los dos casos, **la app sigue funcionando en local**: un token caducado degrada
la sincronización, no la aplicación. El aviso vive en Ajustes y en el indicador de `estado-sync`,
nunca como un diálogo que interrumpa el registro del día.

## Desconectar

Un botón que borra el token de verdad. Y una segunda opción, separada y con confirmación
explícita: borrar también los datos locales. Son dos cosas distintas —cambiar de token no debería
llevarse el historial— y mezclarlas en un solo botón es cómo se pierden datos.

Al desconectar se recuerda que **el token sigue vivo en GitHub** hasta que se revoque allí, con
enlace directo a la página donde hacerlo.

## Criterios de aceptación

- [ ] La app arranca y es plenamente usable sin token.
- [ ] La pantalla de conexión enlaza a GitHub y detalla repositorio y permiso.
- [ ] Token inválido, repo inaccesible y permiso insuficiente dan tres mensajes distintos.
- [ ] El token no aparece en ningún log, URL ni mensaje de error. Verificado a mano.
- [ ] La CSP no permite `histunsafe-inline` ni orígenes externos.
- [ ] Con el token caducado, el registro diario sigue funcionando y el aviso no interrumpe.
- [ ] Desconectar y borrar datos locales son dos acciones separadas.
