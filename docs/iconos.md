# Iconos e ilustraciones

## Decisión: base de terceros para los iconos, dibujo propio para las ilustraciones

Dibujar veinticinco iconos consistentes es una semana de trabajo de alguien con oficio, y el
resultado casi siempre es peor que una biblioteca decente. **Se usa Lucide** como base —licencia
MIT, retícula de 24 px, trazo uniforme— y se importa icono a icono para no cargar el paquete
entero.

Esto no contradice el "sin librería de componentes" de `stack`. Un componente de UI trae maquetado
y estilos que hay que desmontar; un icono de trazo es un `<svg>` que hereda `currentColor` y el
grosor de trazo del contexto. Se integra con los tokens sin pelea porque no impone nada.

Lo que sí se dibuja a mano son los tres o cuatro iconos que la app necesita y ninguna biblioteca
tiene: el heatmap, el concepto de hábito frente al de estado de ánimo, y la marca de
sincronización con el repo.

## Reglas

- **`currentColor` siempre.** Ningún icono lleva color propio. Cambia el tema y cambian los
  iconos, gratis.
- Retícula de 24 px y grosor de trazo desde token, para que los propios y los de Lucide sean
  indistinguibles.
- `aria-hidden` cuando acompañan a un texto; `aria-label` cuando van solos. Ya lo exige `ui-kit`.
- El área táctil la da el botón, no el icono. Un icono de 20 px dentro de un objetivo de 44 px.

## Ilustraciones de estado vacío

Cuatro, las que `flujos` declara necesarias:

| Estado                     | Qué transmite                                |
| -------------------------- | -------------------------------------------- |
| Sin hábitos                | Invitación a crear el primero, no un error   |
| Sin datos para una gráfica | Paciencia: "vuelve dentro de unos días"      |
| Historial vacío            | Igual que el anterior, en tono de calendario |
| Sin conexión               | Tranquilidad: todo sigue funcionando         |

Aquí sí se dibuja desde cero, y con una regla que las mantiene coherentes: **el mismo lenguaje
geométrico del logo**. Si `logo` se resuelve con la retícula de celdas, las ilustraciones son
composiciones de esas mismas celdas. Sale un sistema visual reconocible sin necesidad de talento
ilustrativo, que es la forma honesta de resolver esto.

Restricciones: SVG, dos colores como máximo —un tono de texto atenuado más el acento—, legibles
en tema claro y oscuro, y sin texto dentro del SVG, que va aparte para poder traducirse.

Y un límite de tono que conviene fijar por escrito: nada de personajes, mascotas ni caras. Una app
que se abre todos los días durante años no debe hacer un chiste cada vez que falta un dato.

## Peso

Los iconos, importados uno a uno, no llegan a unos pocos kB en total. Las ilustraciones van
inlineadas como componentes React, no como ficheros que pidan una petición de red: son cuatro y
se ven precisamente cuando puede no haber conexión.

## Criterios de aceptación

- [ ] Inventario cerrado de iconos usados, sin importaciones muertas.
- [ ] Ningún SVG contiene un color literal; todos heredan `currentColor`.
- [ ] Los iconos propios y los de Lucide son indistinguibles en peso de trazo y retícula.
- [ ] Las cuatro ilustraciones existen y se ven correctas en ambos temas.
- [ ] Las ilustraciones no requieren red para mostrarse.
- [ ] Los textos de los estados vacíos están fuera del SVG.
