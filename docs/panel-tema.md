# Panel de customización

Aquí es donde el diferenciador de `vision` deja de ser una propiedad del código y se convierte en
algo que el usuario puede tocar. El panel no inventa nada: **implementa exactamente el contrato de
customización de `charts` y las familias de tokens de `tokens`**, ni una opción más ni una menos.

## Dónde vive

Ajustes → Apariencia. Una sola pantalla con secciones, no un asistente por pasos.

## Secciones

### Tema

Claro, oscuro o seguir al sistema. Tres opciones, la tercera por defecto.

### Color

- **Acento** de la aplicación: una fila de presets más selector libre.
- **Color por hábito o categoría**: se edita en la ficha de cada hábito, dentro del CRUD de
  `habitos`. Aquí sólo hay un acceso directo, para no tener dos sitios donde cambiar lo mismo.

### Tipografía

Los tres stacks que fijó `tokens` —sans, serif, monoespaciada— más la del sistema. Sin cargar
fuentes desde una URL: la app presume de funcionar offline.

### Densidad

Cómoda o compacta. Con el suelo de 36 px de área táctil y sin tocar el tamaño del texto, tal como
lo dejó `tokens`.

### Gráficas

Lo que el contrato de `charts` declara customizable: tipo de visualización por métrica, curva de
la línea, rejilla visible y radio de las celdas del heatmap.

### Movimiento

Animaciones activadas o no. Si el sistema pide movimiento reducido, se respeta por defecto y se
indica por qué está desactivado.

## Vista previa: la propia app

Nada de un recuadro de muestra. Los cambios se aplican **en el momento** sobre la aplicación
entera, porque cambiar variables CSS en el elemento raíz no cuesta ni un repintado costoso.

La consecuencia de diseño es que el panel debe dejar ver la app detrás: en móvil es un `Sheet`
que ocupa la mitad inferior, con el heatmap visible arriba. Se elige un color y se ve
inmediatamente cómo queda en los datos reales, que es la única prueba que importa.

Y un botón de **restablecer** siempre visible, que es lo que da permiso para experimentar.

## Contraste

Al elegir un acento se calcula el contraste contra el fondo del tema activo. Si no llega a 4.5:1,
**se avisa pero no se bloquea**: es su app y su decisión. El aviso propone la variante más cercana
que sí cumple, a un toque.

Lo que sí es automático, y no negociable, es el color del texto sobre un relleno de color: se
elige claro u oscuro según la luminosidad del color, nunca se deja a la suerte. La regla la fijó
`tokens` y aquí se aplica.

## Persistencia y sincronización

En la tabla `settings` de `dexie`. Y una distinción que evita un fastidio real:

| Preferencia                                       | Ámbito                               |
| ------------------------------------------------- | ------------------------------------ |
| Tema, paleta, tipografía, preferencias de gráfica | **Se sincroniza** entre dispositivos |
| Densidad                                          | **Por dispositivo**                  |

La densidad es lo único que legítimamente difiere entre un móvil y un monitor de 27 pulgadas.
Sincronizarla sería imponer al iPad la elección hecha en el escritorio.

### Deuda que esto abre

Lo que se sincroniza tiene que vivir en algún sitio del repo de datos, y `adr-repo` define
`schemas/`, `entries/` y `meta.json`: **no hay sitio para las preferencias**. Hace falta un
`settings.json` en la raíz, fusionable con las mismas reglas de `adr-sync`.

Es un cambio en una tarjeta aprobada, así que va por su propia propuesta sobre `adr-repo`. Queda
anotado, no supuesto.

## Lo que no es customizable

Y conviene decirlo en la propia interfaz, no sólo aquí: el color de marca del logo, los iconos,
el radio de los componentes de formulario y la disposición de las pantallas. Lo último llega en
v1.5 con `dashboard`.

## Criterios de aceptación

- [ ] Cada fila del contrato de customización de `charts` tiene su control en este panel.
- [ ] Cambiar cualquier opción se refleja al instante en la app visible detrás del panel.
- [ ] Un acento con contraste insuficiente avisa y ofrece la alternativa más cercana.
- [ ] Restablecer devuelve todo al estado inicial en un toque.
- [ ] Tema y tipografía viajan entre dispositivos; la densidad no.
- [ ] Con movimiento reducido activo en el sistema, el conmutador refleja el porqué.
