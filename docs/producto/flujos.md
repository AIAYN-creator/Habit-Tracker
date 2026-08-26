# Flujos de UX

El criterio de éxito de `vision` —registrar el día completo en menos de treinta segundos— no se
consigue con una pantalla bonita: se consigue eliminando pasos. Este documento decide cuáles.

## Navegación

Barra inferior con cuatro destinos en móvil, lateral en escritorio:

| Destino       | Qué es                                              |
| ------------- | --------------------------------------------------- |
| **Hoy**       | Registro del día. Es la pantalla de inicio, siempre |
| **Historial** | Calendario y lista, con conmutador                  |
| **Gráficas**  | Heatmap, series y barras                            |
| **Ajustes**   | Schema, tema y sincronización                       |

Cuatro y no cinco: el CRUD de hábitos vive dentro de Ajustes, no como destino propio. Se toca una
vez a la semana como mucho, y ocupar un cuarto del espacio de navegación con ello resta al uso
diario.

Abrir la app siempre lleva a **Hoy**, sin recordar dónde estabas. Es una app que se abre una vez
al día para hacer una cosa.

## Flujo 1 — Registro diario

El flujo crítico. Todo lo demás se subordina a este.

```
Abrir → Hoy → tocar hábitos → mood → (opcional) nota → salir
```

Reglas:

- **No hay botón de guardar.** Cada interacción escribe en el momento, con confirmación visual en
  el propio control. Un botón de guardar es un paso más y una forma de perder datos por olvido.
- **Toque único para los booleanos.** Sin confirmación, sin diálogo. El deshacer es el toast.
- Los hábitos aparecen en el orden del schema, y los que hoy no toca —por su `frequency`— se
  muestran atenuados al final, registrables pero sin reclamar atención.
- El mood va **después** de los hábitos: los hábitos son mecánicos y rápidos, el mood requiere un
  segundo de introspección. Poner lo lento primero invita a cerrar la app.
- La nota está plegada. Se despliega al tocarla. La mayoría de días no se escribe nada.
- Al terminar no hay pantalla de "¡Bien hecho!". Se sale y ya está.

**Registro de días pasados:** desde Hoy se puede retroceder al día anterior con un gesto o una
flecha. Es el caso real de quien se acuesta y lo registra a la mañana siguiente, y sin esto la
app se abandona el primer día que se olvida.

## Flujo 2 — Definir y editar el schema

```
Ajustes → Hábitos → [+] → nombre → tipo → configuración del tipo → color → guardar
```

- El tipo se elige **al crear** y no se puede cambiar después: lo prohíbe `modelo`. La UI no
  muestra el campo deshabilitado con un candado, muestra la acción real: *"Archivar y crear
  uno nuevo"*.
- Archivar pide confirmación y explica en una frase qué pasa: desaparece del registro diario,
  sigue en el historial y en las gráficas.
- Reordenar por arrastre. Es el orden en que se ven cada día, así que importa más de lo que
  parece.
- El color se elige de una paleta sugerida, coherente con el tema, más la opción de color libre.

Las dimensiones de mood siguen el mismo flujo en su propia sección.

## Flujo 3 — Historial

Conmutador entre dos vistas del mismo dato:

- **Calendario:** un mes, cada día con un indicador compacto de cumplimiento. Tocar un día abre
  su detalle.
- **Lista:** días en orden inverso, con lo registrado resumido en una línea.

Editar un día pasado usa **exactamente la misma pantalla** que Hoy, sin modo de edición aparte.
Un solo componente, un solo comportamiento, la mitad de errores.

Los días sin registrar se ven distintos de los días con todo a cero. Es la distinción que `modelo`
protege en los datos y que aquí se hace visible.

## Flujo 4 — Primer arranque

Sin tutorial ni carrusel. Tres pasos:

1. Una pantalla que dice qué es la app en una frase.
2. **Crear los primeros hábitos**, con una lista de sugerencias tocables —agua, ejercicio, leer,
   dormir bien— y la opción de escribir el propio. Una app de hábitos con la pantalla vacía es
   una app que se cierra.
3. Registrar hoy. La sincronización **no** se pide ahora: se propone más tarde, cuando ya haya
   algo que perder.

Nada de datos de ejemplo precargados en la base de datos real. Los fixtures de `seed` son para
desarrollo, y mezclarlos con datos reales del usuario es una fuente de confusión difícil de
deshacer.

## Flujo 5 — Sincronización

```
Ajustes → Sincronización → pegar token → elegir repo → conectar
```

Guiado paso a paso, con enlace directo a la pantalla de GitHub donde se crea el token y los
permisos exactos que hay que marcar. Es el punto de más fricción de toda la app y el que más
gente pierde; merece instrucciones literales, no un campo de texto suelto.

Una vez conectada, la sincronización es automática al abrir y al cerrar, más un botón manual.
Nunca bloquea la UI: se registra el día igual mientras sincroniza, falla o no. Los estados los
detalla `estado-sync`.

## Estados que no son la ruta feliz

Se diseñan ahora, no al final, porque son la mitad de lo que se ve el primer mes:

- **Sin hábitos** — la pantalla de bienvenida del flujo 4.
- **Sin datos suficientes para una gráfica** — "Vuelve dentro de unos días", no una gráfica vacía.
- **Sin conexión** — indicador discreto; la app no cambia de comportamiento.
- **Token caducado** — aviso persistente en Ajustes, y el registro diario sigue funcionando.
- **Conflicto de sincronización** — qué se muestra lo decide `adr-sync`; aquí se reserva el sitio.

## Escritorio

Misma app, no un rediseño: navegación lateral, contenido con ancho máximo y centrado, y atajos de
teclado en Hoy —números para marcar hábitos, `Enter` para guardar la nota—. La app se pensó para
el pulgar; en escritorio no debe sentirse como una web móvil estirada, pero tampoco justifica una
segunda interfaz.

## Criterios de aceptación

- [ ] Registrar un día con cinco hábitos y dos dimensiones de mood lleva menos de treinta
      segundos, cronometrado en un móvil real.
- [ ] No existe ningún botón de guardar en el registro diario.
- [ ] Editar un día pasado usa el mismo componente que Hoy.
- [ ] Un día sin registrar y un día con todo a cero se distinguen a simple vista.
- [ ] El primer arranque termina con al menos un hábito creado y el día de hoy registrable.
- [ ] Los cinco estados no felices están diseñados y accesibles desde la app.
