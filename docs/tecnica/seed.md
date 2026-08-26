# Fixtures de desarrollo

Datos sintéticos para desarrollar y probar. Con la base vacía no se puede diseñar un heatmap, y
con datos aleatorios se diseña mal: el ruido blanco no se parece a un año de hábitos reales.

## Regla que no se negocia

**Ningún dato real entra aquí.** Ni una entrada exportada del uso propio, ni una captura con
datos verdaderos. Es un repositorio público. Lo fijó `repo` y este es el sitio donde más fácil
sería saltárselo por comodidad.

## Realismo

Un generador determinista —misma semilla, mismos datos— que produce dieciocho meses de historia
con los patrones que hacen que una visualización se vea como se verá de verdad:

- **Adherencia por hábito**, no uniforme: uno al 90%, otro al 40%, otro que se abandona a los dos
  meses. El heatmap tiene que aguantar los tres.
- **Efecto fin de semana**: el ejercicio sube el sábado, el hábito de trabajo desaparece.
- **Rachas y recaídas**, no una moneda al aire. Diez días seguidos y luego cinco en blanco es lo
  que se ve en la realidad, y es lo que hace bonito o feo un heatmap.
- **Huecos**: días sin registrar, que no son días a cero. La distinción de `modelo` tiene que ser
  visible en los fixtures o nadie la comprobará.
- **Estacionalidad suave** en las escalas de ánimo, para que la línea tenga forma y no sea ruido.

Determinista porque una captura de pantalla que cambia en cada recarga no sirve para comparar dos
diseños, y un test que depende de datos aleatorios falla un martes sin razón aparente.

## Casos límite

Además del conjunto "bonito", un conjunto **feo** que es el que revienta las gráficas:

- Un solo día de datos. Es lo que ve el usuario el primer día y casi nadie lo prueba.
- Un hábito archivado a mitad del histórico.
- Un hábito creado ayer, sin historia.
- Una escala con todos los valores iguales, donde el eje no tiene rango.
- Un contador con un valor atípico enorme.
- Un nombre de hábito muy largo, con tildes y un emoji.

## Cómo se carga

Desde una pantalla de desarrollo accesible sólo con `import.meta.env.DEV`, con dos acciones:
cargar fixtures y vaciar la base.

**Nunca se mezcla con datos reales.** Cargar fixtures pide confirmación y vacía primero: una base
mitad real mitad sintética es imposible de razonar, y borrar lo real por accidente sería el peor
resultado posible de una herramienta de desarrollo.

El código del generador queda fuera del bundle de producción por el `import.meta.env.DEV`,
verificable en el análisis del build.

## Usos

- Desarrollo de `heatmap`, `series`, `barras`, `calendario` y `lista`.
- Tests de las gráficas con datos estables.
- Capturas para el README y para la tienda, si algún día la hay.

## Criterios de aceptación

- [ ] La misma semilla produce exactamente los mismos datos.
- [ ] El conjunto principal cubre los cuatro tipos de hábito y los tres de dimensión.
- [ ] Los seis casos límite existen y son cargables por separado.
- [ ] Los fixtures contienen días sin registrar, distinguibles de días a cero.
- [ ] Cargar fixtures exige confirmación y vacía la base antes.
- [ ] El generador no aparece en el bundle de producción.
