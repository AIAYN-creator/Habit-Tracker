# Controles por tipo de dato

Los cuatro widgets con los que se registra un hábito, más los dos del estado de ánimo. Es donde
se gana o se pierde el criterio de los treinta segundos de `vision`.

Regla común: **cada interacción escribe en el momento** vía `dal.setValue`. No hay botón de
guardar, y el deshacer es el toast de `ui-kit`.

## El problema de "quitar" un valor

`modelo` distingue tres estados y la interfaz tiene que dejarlos expresar los tres:

| Estado | Qué significa |
|---|---|
| Sin clave | No lo registré |
| `false` o `0` | Lo registré y no lo hice |
| Valor | Lo hice |

La solución, igual en todos los controles: **volver a tocar el valor seleccionado lo deselecciona**
y llama a `clearValue`, que borra la clave. Y para dejar constancia explícita de un fallo —"hoy no
he corrido, y quiero que conste"— una pulsación larga marca el cero o el `false`.

Es la parte menos obvia de toda la interfaz y merece una ayuda contextual la primera vez.

## `boolean`

Una fila tocable en toda su anchura, no una casilla de 20 px. Un toque marca, otro toque
desmarca. La transición es de relleno, con el color del hábito, en `--duration-fast`.

## `counter`

Menos y más a los lados de la cifra, con el `step` de la configuración. Mantener pulsado repite,
acelerando. Tocar la cifra abre un teclado numérico para valores grandes, que es más rápido que
pulsar catorce veces.

Nunca baja de cero: en el cero, el botón de restar deselecciona.

## `duration`

Atajos con los valores más habituales del hábito —15, 30, 45, 60 minutos, derivados del `target`—
más "otro" para el teclado numérico. Se guarda **siempre en minutos**, como fija `modelo`, aunque
se muestre "1 h 30".

## `scale`

Control segmentado con los valores del rango y las etiquetas de los extremos debajo, que es para
lo que `moods` insiste en pedirlas. Un toque selecciona.

Rangos largos —más de siete valores— pasan a deslizador con la cifra encima; una fila de diez
segmentos en un móvil son objetivos de 30 px y se falla al pulsar.

## `tags`

Chips de las sugerencias configuradas, tocables, más un campo para escribir uno nuevo. Los nuevos
se guardan y se ofrecen después como sugerencia.

## `note`

Área de texto que crece con el contenido, plegada por defecto. Se guarda con retardo de un
segundo desde la última tecla, no en cada pulsación: no tiene sentido encolar una escritura por
letra.

## Accesibilidad

Roles nativos, que ya traen el comportamiento de teclado esperado: `switch` para el booleano,
`spinbutton` para contador y duración, `radiogroup` para la escala, y las etiquetas de `Field` en
todos. La pulsación larga necesita alternativa accesible: en teclado, `Shift`+Espacio.

## Vibración

Un pulso muy corto al marcar, en los dispositivos que lo soporten, conmutable en ajustes y
desactivado si el sistema pide movimiento reducido. Es lo que hace que marcar un hábito se sienta
como pulsar un botón físico. Es también lo primero que molesta a quien no lo quiere, de ahí el
interruptor.

## Criterios de aceptación

- [ ] Los cuatro tipos de hábito y los tres de mood tienen su control.
- [ ] Volver a tocar el valor seleccionado borra la clave, y se comprueba que no escribe cero.
- [ ] La pulsación larga registra el cero o el `false` explícito.
- [ ] La duración se guarda en minutos y se muestra en horas y minutos.
- [ ] Una escala de más de siete valores usa deslizador.
- [ ] Todos los controles son operables con teclado, con los roles correctos.
- [ ] La nota no encola una escritura por cada tecla.
