# Guía de uso

Para quien usa **Track Your Way**, no para quien la programa. Las decisiones de diseño están en
[`docs/`](docs/README.md); esto es lo otro.

La app: <https://aiayn-creator.github.io/Habit-Tracker/>

## Lo primero: no hace falta pagar nada

**Los repositorios privados de GitHub son gratuitos.** Es la duda que aparece siempre, así que va
la primera. No necesitas ningún plan de pago para usar esto.

## Puesta en marcha

### 1. Crea el repositorio de tus datos

En GitHub, un repositorio nuevo, **privado**, vacío. El nombre da igual; `habit-tracker-data` es
tan bueno como cualquiera.

Privado no es opcional: ahí va tu registro diario de hábitos y estado de ánimo.

### 2. Genera el token

En <https://github.com/settings/personal-access-tokens/new>:

| Campo                  | Qué poner                                             |
| ---------------------- | ----------------------------------------------------- |
| Repository access      | **Only select repositories** → el que acabas de crear |
| Permissions → Contents | **Read and write**                                    |
| Expiration             | Lo que quieras, hasta un año                          |

Sólo ese permiso y sólo ese repositorio. El token no podrá ver nada más de tu cuenta.

**Uno por dispositivo.** Si pierdes el móvil, revocas ese token y los demás siguen funcionando.

### 3. Conéctalo

En la app: **Sincronización** → escribe `tu-usuario/tu-repo`, pega el token y conecta. Se
comprueba al momento; si algo falla te dice qué, no un número de error.

## Cómo funciona la sincronización

Tus datos viven **en tu dispositivo**. La app funciona entera sin red: registras, consultas el
historial y ves las gráficas igual.

Cuando hay conexión, se copian a tu repositorio: un fichero JSON por día, más los dos ficheros
que definen tus hábitos y tus dimensiones de ánimo. Ocurre al abrir la app, al cerrarla y cuando
pulsas _Sincronizar ahora_.

Dos cosas que conviene saber sin tener que descubrirlas:

- **No es tiempo real.** Si registras en el móvil y abres el iPad diez segundos después, puede que
  aún no esté. La latencia no es de red, es de cuándo sincronizó cada uno.
- **Cada dispositivo necesita su propio token.** Estar logueado en GitHub en el navegador no sirve:
  la app no usa tu sesión.

Si editas el mismo día desde dos sitios sin sincronizar en medio, se combinan las partes que no
chocan: si en uno marcaste _correr_ y en otro _leer_, se quedan los dos. Sólo cuando ambos tocaron
**lo mismo** gana el más reciente, y el descartado queda anotado en Sincronización, recuperable.

## Recuperar tus datos

El apartado que justifica toda la arquitectura.

**En un dispositivo nuevo:** instala la app, pega un token y sincroniza. Ya está: no hay proceso
de importación.

**Sin la app:** clona el repositorio y lee los JSON. Un día es así de simple:

```json
{
  "date": "2026-08-26",
  "habits": { "h_run": 35, "h_read": true },
  "moods": { "m_animo": 4 },
  "note": "Día raro pero bien.",
  "updatedAt": "2026-08-26T21:40:02Z"
}
```

**Si algo se corrompe:** el historial de Git tiene todas las versiones anteriores.

```bash
git log --oneline -- entries/2026/2026-08-26.json
```

```bash
git checkout <commit> -- entries/2026/2026-08-26.json
```

## Cuando algo va mal

| Síntoma                                          | Qué pasa                                                              | Qué hacer                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| "El acceso a GitHub ha caducado"                 | El token expiró o fue revocado                                        | Genera otro y vuelve a conectar                                                |
| "El token no tiene permiso para escribir"        | Falta `Contents: read and write`                                      | Revisa los permisos del token                                                  |
| No sincroniza y no dice nada                     | Sin conexión                                                          | Nada: los cambios se envían solos al volver                                    |
| Faltan datos en el iPad tras semanas sin abrirlo | iOS borra el almacenamiento de sitios que no se visitan en siete días | Sincroniza y vuelven. Instala la app en la pantalla de inicio para que no pase |
| No aparece "Instalar" en iPhone                  | iOS no lo ofrece                                                      | Compartir → Añadir a pantalla de inicio                                        |
| Sale un aviso de versión nueva                   | Hay una actualización                                                 | Pulsa _Recargar_ cuando te venga bien; no se recarga sola                      |

## Privacidad

- **Qué se guarda:** los hábitos que defines y lo que registras cada día. Nada más.
- **Dónde:** en tu navegador, y en tu repositorio privado si conectas la sincronización.
- **Quién puede verlo:** tú. No hay servidor intermedio: la app habla directamente con GitHub.
- **Al borrar una entrada:** desaparece de la app y del repositorio, **pero sigue en el historial
  de Git**. Es cómo funciona Git, y es también la red que te salva de un borrado accidental.

## Instalar la app

- **Android:** el navegador ofrece instalarla.
- **iPhone / iPad:** Compartir → _Añadir a pantalla de inicio_.
- **Escritorio:** el icono de instalar en la barra de direcciones de Chrome o Edge.

Instalada funciona sin conexión y, en iOS, protege tus datos del borrado automático.
