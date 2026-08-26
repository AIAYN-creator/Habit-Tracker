# Cola offline

La `outbox` es lo que convierte "funciona sin red" en algo cierto y no en una promesa. Cada
escritura la encola `dal` en la misma transacción que el dato, así que no existe el caso de un
cambio guardado que nadie vaya a enviar.

## Qué se encola

La **ruta del fichero afectado**, no el contenido. Cuando llegue el momento de empujar, el
contenido se lee de la base en ese instante.

La diferencia importa: si tocas el mismo día cinco veces sin red, la cola no debe acumular cinco
versiones del fichero, sino saber que hay un fichero pendiente. Encolar rutas hace que la
deduplicación sea trivial y que lo que se envía sea siempre el estado actual, no una foto vieja.

## Deduplicación

Al encolar, si ya hay una entrada pendiente para esa ruta, se actualiza su marca de tiempo y no se
añade otra. Una semana sin red con veinte ediciones sobre siete días deja siete elementos en la
cola, no veinte.

## Reintentos

Espaciados y con techo: 30 segundos, 2 minutos, 10 minutos, y a partir de ahí cada 10 minutos
mientras la app esté abierta. Sin bucle apretado contra la API de nadie.

Se reinicia el contador cuando cambia la condición: al volver la red, al abrir la app, o al pulsar
el botón manual. Un usuario que toca "sincronizar ahora" espera un intento inmediato, no que se
respete un temporizador interno.

## Qué dispara un vaciado

- Recuperar la conexión, escuchando el evento `online`.
- Abrir la app o volver del segundo plano.
- El botón manual.
- El temporizador de reintento, si hay algo pendiente y fallido.

Nunca al escribir. Encolar y enviar son cosas distintas: registrar un hábito no debe disparar una
petición de red que compita con el siguiente toque del usuario.

## Errores que no se reintentan

Reintentar sin criterio es cómo se agota la cuota de la API y se calienta la batería. **No** se
reintenta automáticamente:

- Token inválido o caducado (401, 403 de permisos). Requiere que el usuario actúe.
- Fichero remoto ilegible. Requiere decisión.
- Repo inexistente o sin acceso.

En esos casos la cola se queda quieta, con su motivo, y `estado-sync` lo muestra. Los cambios
siguen ahí: nada se descarta.

## Persistencia

La cola vive en IndexedDB, así que sobrevive a cerrar la app y a reiniciar el dispositivo. Una
cola en memoria sería una promesa rota en cuanto el sistema mata la pestaña por falta de memoria,
que en móvil pasa constantemente.

## Límite

Si la cola supera unos cientos de elementos, algo va mal: se avisa en lugar de seguir acumulando
en silencio. No es un límite que se espere alcanzar con un fichero por día.

## Criterios de aceptación

- [ ] Registrar sin red encola y no lanza ninguna petición.
- [ ] Cinco ediciones del mismo día dejan un solo elemento en la cola.
- [ ] Al recuperar la red, la cola se vacía sola en un único commit.
- [ ] Los reintentos se espacian y se reinician al abrir la app o pulsar el botón manual.
- [ ] Un 401 detiene los reintentos y lo explica, sin perder los cambios.
- [ ] La cola sobrevive a cerrar la app por completo.
