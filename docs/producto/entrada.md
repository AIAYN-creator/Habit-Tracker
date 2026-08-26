# Registro de entrada diaria

La pantalla que justifica la app. Todo lo demás existe para que esta funcione: el criterio de
`vision` es el día completo registrado en menos de treinta segundos.

## Estructura

```
[ < ]   martes, 26 de agosto   [ hoy ]
────────────────────────────────────
Hábitos
  [control por tipo, uno por hábito activo]
  ── esperados hoy arriba, el resto atenuados abajo ──

Estado de ánimo
  [control por dimensión activa]

Nota            (plegada)
```

Sin botón de guardar, sin pantalla de confirmación, sin felicitación al terminar. Se registra y se
sale.

## El día y su navegación

La cabecera muestra el día que se está editando. Una flecha retrocede, y un botón "hoy" vuelve al
presente cuando no estás en él.

Poder retroceder es un requisito, no una comodidad: el caso real es acostarse sin registrar y
hacerlo a la mañana siguiente. Sin esto, la app se abandona el primer día que se olvida.

No se puede navegar al futuro. Registrar el jueves que viene no significa nada.

## Orden

Hábitos primero, ánimo después. Los hábitos son mecánicos —tocar, tocar, tocar— y el ánimo pide un
segundo de introspección. Poner lo lento primero invita a cerrar la app antes de terminar.

Dentro de los hábitos, primero los esperados hoy según su `frequency`, y después los que no
tocaban, atenuados pero registrables: haber salido a correr un día que no tocaba merece anotarse.

## Escritura

Cada control escribe en el momento vía `dal`, con la semántica de tres estados que define
`inputs`. Un toast con "Deshacer" cubre el error, y deshacer revierte la escritura de verdad, no
sólo lo que se ve.

No hay estado intermedio en memoria que pueda perderse: si la app se cierra a mitad, lo registrado
está registrado.

## Reutilización en el historial

Esta misma pantalla es la que abre el historial al tocar un día pasado. **Un componente, un
comportamiento.** No hay "modo edición" ni una variante de sólo lectura: editar el martes pasado es
exactamente lo mismo que registrar hoy, con otra fecha en la cabecera.

Es lo que decidió `flujos` y aquí es donde se materializa: cualquier mejora del registro diario
mejora la edición del pasado, gratis.

## Estados

- **Sin hábitos**: la pantalla de bienvenida con sugerencias, no una lista vacía.
- **Todo registrado**: sin fanfarria. Como mucho, un cambio sutil en la cabecera.
- **Día futuro**: no accesible.
- **Cargando**: la primera consulta a IndexedDB devuelve `undefined`, y eso no es "vacío". Un
  esqueleto breve, no una lista de hábites en blanco que aparezca de golpe.

## Rendimiento percibido

Es la pantalla de arranque, así que su tiempo hasta interactivo es el tiempo de arranque de la
app. Los datos del día son una única lectura por clave primaria; lo que no debe hacer es esperar
a la sincronización, que ocurre en paralelo y no bloquea nada.

## Criterios de aceptación

- [ ] Registrar cinco hábitos y dos dimensiones lleva menos de treinta segundos en un móvil real.
- [ ] No existe ningún botón de guardar.
- [ ] Se puede retroceder al día anterior y volver a hoy; el futuro no es accesible.
- [ ] El historial abre esta misma pantalla, sin un componente aparte.
- [ ] Los hábitos no esperados hoy aparecen atenuados y siguen siendo registrables.
- [ ] Cerrar la app a mitad de registro no pierde nada de lo ya tocado.
- [ ] "Cargando" y "sin datos" se distinguen en la interfaz.
