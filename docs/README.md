# Decisiones

Espejo de las tarjetas **aprobadas** del tablero de Histos con el que se lleva este proyecto.
Cada fichero es una decisión cerrada y firmada, no un borrador.

| Documento | Qué fija |
|---|---|
| [vision.md](vision.md) | Diferenciador, principios, alcance de v1 y qué queda fuera |
| [modelo.md](modelo.md) | Modelo de datos schema-driven: hábitos, moods y entradas |
| [stack.md](stack.md) | Stack, estructura de carpetas y reglas de dependencia |
| [charts.md](charts.md) | ADR de la librería de gráficas y contrato de customización |
| [tokens.md](tokens.md) | Design tokens: color, tipografía, espaciado, densidad |
| [repo.md](repo.md) | Licencia, convención de commits y separación código/datos |

## Sobre la fuente de verdad

El tablero de Histos es el canon: aquí sólo se copia lo ya aprobado, para que quien lea el
código tenga las decisiones al lado sin depender del vault. Si un documento y el código se
contradicen, gana el documento; si un documento y el tablero se contradicen, gana el tablero y
este espejo está desactualizado.

Estos ficheros **no se editan a mano**. Un cambio de decisión se propone y se aprueba en el
tablero, y de ahí baja aquí.

## Deuda anotada

- `modelo` necesita un bloque `display` en `habits.json` para el tipo de visualización por
  métrica. Está en el scope del proyecto, no en el schema aprobado. Ver la sección
  correspondiente de [charts.md](charts.md).
