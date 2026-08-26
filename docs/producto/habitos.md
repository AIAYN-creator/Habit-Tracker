# CRUD de hábitos

Pantalla de Ajustes → Hábitos. Se usa una vez a la semana como mucho, así que prioriza claridad
sobre velocidad: aquí sí hay botón de guardar, al contrario que en el registro diario.

## Lista

- Los hábitos activos en su orden, **reordenables arrastrando**. Ese orden es el que se ve cada
  día al registrar, así que importa más de lo que parece.
- Cada fila: color, nombre, tipo y frecuencia en una línea.
- Los archivados, plegados al final tras un "Archivados (3)".
- Estado vacío con las sugerencias de `flujos`: agua, ejercicio, leer, dormir bien.

## Crear

Un `Sheet` con los campos en el orden en que se piensan:

1. **Nombre.**
2. **Tipo** — cuatro opciones con un ejemplo cada una, porque "escala" y "contador" no significan
   nada sin verlo. Ejemplos: *¿Lo hiciste?* / *¿Cuántas veces?* / *¿Cuánto tiempo?* / *Del 1 al 5*.
3. **Configuración del tipo** — aparece al elegirlo: unidad y paso para contador y duración,
   mínimo, máximo y etiquetas para escala. Nada para booleano.
4. **Frecuencia** — diaria, N veces por semana, días concretos, o sin expectativa.
5. **Color** — paleta sugerida coherente con el tema, más selector libre.

El identificador se genera solo y no se muestra: es un detalle del formato de fichero, no del
producto.

## Editar

Todo se puede cambiar **menos el tipo**. Y la interfaz no enseña un campo deshabilitado con un
candado, que sólo genera frustración: enseña la acción que sí existe.

> El tipo no se puede cambiar, porque las entradas ya registradas dejarían de tener sentido.
> **Archivar y crear uno nuevo** →

Ese botón abre el formulario de creación con el nombre y el color ya rellenos y el tipo por
elegir, y archiva el anterior al guardar. Dos toques en lugar de un callejón sin salida.

Reducir el rango de una escala pasa por `validacion`: si hay valores fuera del rango nuevo, se
bloquea diciendo cuántas entradas afecta; si no los hay, se permite sin ceremonia.

## Archivar y borrar

**Archivar** es la acción normal. Confirmación con una frase que explica qué pasa: desaparece del
registro diario, sigue en el historial y en las gráficas.

**Borrar de verdad** sólo existe para hábitos **sin ninguna entrada registrada**. Es el caso real
de haberlo creado con una errata hace cinco minutos. Con datos detrás, la única salida es
archivar: borrar dejaría claves huérfanas en meses de ficheros.

## Reordenar

Arrastre con teclado alternativo —seleccionar y mover con las flechas—, porque un reordenamiento
que sólo funciona con el dedo no es accesible. Se escribe el campo `order` de todos los afectados
en una sola transacción, no uno a uno.

## Criterios de aceptación

- [ ] Crear un hábito de cada uno de los cuatro tipos, con su configuración propia.
- [ ] El tipo no es editable, y la alternativa de archivar y crear funciona con dos toques.
- [ ] Reducir una escala se bloquea con datos afectados e informa de cuántos.
- [ ] Borrar sólo está disponible sin entradas; con entradas, sólo archivar.
- [ ] Archivar saca el hábito del registro diario y lo mantiene en el historial.
- [ ] Reordenar funciona con arrastre y con teclado, y persiste.
