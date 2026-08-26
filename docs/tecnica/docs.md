# Guía de uso

La documentación para quien usa la app, no para quien la programa. Vive aparte de `docs/`, que es
el espejo de decisiones del tablero y sirve a otro lector.

## Quién la lee

Dos personas, y conviene no confundirlas:

- **Tú, dentro de dos años**, cuando el token caduque y no recuerdes qué permisos marcaste.
- **Alguien técnico a quien le enseñas la app** y quiere montársela. No es público general: montar
  esto exige una cuenta de GitHub y saber crear un repo, y eso ya está asumido en `vision`.

Lo que no es: un manual de la interfaz. Si hay que explicar cómo se marca un hábito, el problema
está en la interfaz, no en la documentación.

## Dónde vive

| Sitio | Qué lleva |
|---|---|
| `GUIA.md` en el repo de código | La guía completa |
| Ayuda en la app, en Ajustes | Enlaces a las secciones concretas |
| `README.md` del repo de datos | Cómo leer los ficheros sin la app |

Las instrucciones del token se muestran **también dentro de la app**, en el flujo de conexión, y
no sólo aquí: `auth-gh` lo exige y `qa` lo cronometra. Esta guía es la versión larga, con capturas.

## Contenido

### Puesta en marcha

1. Crear el repositorio de datos, privado.
2. Crear el token de grano fino: qué repositorio, qué permiso, qué caducidad, con captura de la
   pantalla de GitHub tal como está.
3. Pegarlo en la app y verificar.

Con una advertencia clara al principio: **los repos privados de GitHub son gratuitos**, no hace
falta ningún plan de pago. Es la duda que aparece siempre.

### Cómo funciona la sincronización, en cristiano

Cuatro párrafos, sin jerga: los datos viven en tu dispositivo, se copian a tu repo al abrir y
cerrar la app, cada día es un fichero, y si editas el mismo día desde dos sitios se combinan las
partes que no chocan.

Con lo que hay que saber sin buscarlo: **no es tiempo real**, y **cada dispositivo necesita su
propio token**.

### Recuperar los datos

El apartado que justifica toda la arquitectura, y el que más se agradece el día que hace falta:

- En un dispositivo nuevo: instalar, pegar el token, sincronizar.
- Sin la app: clonar el repo y leer los JSON, con un ejemplo de cómo está montado un fichero de
  día.
- Si algo se corrompe: el historial de Git tiene todas las versiones anteriores, con el comando
  concreto para recuperar un fichero de una fecha.

### Cuando algo va mal

Tabla de síntoma, causa y arreglo: no sincroniza, aviso de token caducado, un conflicto en el
registro, datos que faltan tras semanas sin abrir la app en el iPad —que es el borrado de
almacenamiento de iOS que documenta `pwa`—, y la app que no se instala en iOS.

### Privacidad, en una frase por punto

Qué se guarda, dónde, quién puede verlo y qué queda en el historial de Git al borrar una entrada.
Lo último especialmente: es la decisión de `adr-repo` y quien use esto tiene derecho a saberla sin
leer una ADR.

## Cuándo se escribe

**Al final, no ahora.** Una guía escrita antes de que exista la interfaz documenta una app
imaginaria, y hay que reescribirla entera. Se redacta durante las dos semanas de uso real de `qa`,
que es cuando se sabe qué necesita explicación de verdad.

Lo que sí se puede hacer antes es capturar las pantallas de GitHub del flujo del token, que no
dependen de nuestra app.

## Criterios de aceptación

- [ ] `GUIA.md` cubre las cinco secciones.
- [ ] El flujo del token lleva capturas reales y actualizadas.
- [ ] Dice explícitamente que los repos privados son gratis y que cada dispositivo necesita su token.
- [ ] La recuperación de datos incluye el comando concreto para sacar una versión antigua.
- [ ] Alguien técnico monta la app siguiendo sólo la guía, sin preguntar nada. Probado con una persona.
- [ ] Ajustes enlaza a las secciones relevantes.
