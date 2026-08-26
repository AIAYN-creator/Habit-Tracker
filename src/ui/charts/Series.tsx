import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX, curveStepAfter } from '@visx/curve';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { GridRows } from '@visx/grid';
import { LinePath } from '@visx/shape';
import { ChartFrame } from './ChartFrame';
import { MARGIN, type Size } from './geometry';

export interface Point {
  date: string;
  value: number | null;
}

interface Props {
  title: string;
  points: Point[];
  min: number;
  max: number;
  color: string;
  labels?: [string, string];
  curve?: 'smooth' | 'step';
  grid?: boolean;
}

/**
 * Linea para escalas. Ver docs/graficas/series.md.
 *
 * Dos reglas que evitan que la grafica mienta: el eje Y es el rango declarado
 * de la escala y no el de los datos —autoescalar convierte medio punto de
 * variacion en una montaña rusa—, y un dia sin registrar rompe la linea en vez
 * de interpolarse, porque interpolar seria inventar el animo de un dia que
 * nadie anoto.
 */
export function Series({ title, points, min, max, color, labels, curve, grid }: Props) {
  const withValue = points.filter((point) => point.value !== null);
  const empty = withValue.length < 2;

  const table = (
    <table>
      <caption>{title}</caption>
      <tbody>
        {withValue.map((point) => (
          <tr key={point.date}>
            <th scope="row">{point.date}</th>
            <td>{point.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const average =
    withValue.reduce((total, point) => total + (point.value ?? 0), 0) / (withValue.length || 1);

  return (
    <ChartFrame
      title={title}
      label={`${title}: ${String(withValue.length)} días registrados, media ${average.toFixed(1)} de ${String(max)}`}
      empty={empty}
      table={table}
      footer={labels ? `${labels[0]} → ${labels[1]}` : undefined}
    >
      {({ width, height }: Size) => {
        const innerWidth = width - MARGIN.left - MARGIN.right;
        const innerHeight = height - MARGIN.top - MARGIN.bottom;
        const x = scaleTime({
          domain: [dateOf(points[0]?.date), dateOf(points.at(-1)?.date)],
          range: [0, innerWidth],
        });
        // El dominio es la escala declarada, no el rango de los datos.
        const y = scaleLinear({ domain: [min, max], range: [innerHeight, 0] });

        // Cada tramo continuo es su propia linea: los huecos no se cosen.
        const segments: Point[][] = [];
        let current: Point[] = [];
        for (const point of points) {
          if (point.value === null) {
            if (current.length > 0) segments.push(current);
            current = [];
          } else {
            current.push(point);
          }
        }
        if (current.length > 0) segments.push(current);

        return (
          <Group left={MARGIN.left} top={MARGIN.top}>
            {grid ? (
              <GridRows
                scale={y}
                width={innerWidth}
                numTicks={Math.min(max - min + 1, 5)}
                stroke="var(--color-border)"
              />
            ) : null}
            <AxisLeft
              scale={y}
              numTicks={Math.min(max - min + 1, 5)}
              // Una escala de 1 a 5 no tiene un 2.5: enteros.
              tickFormat={(value) => String(Math.round(Number(value)))}
              stroke="var(--color-border)"
              tickStroke="var(--color-border)"
              tickLabelProps={() => ({
                fill: 'var(--color-text-muted)',
                fontSize: 10,
                textAnchor: 'end',
                dx: -4,
                dy: 3,
              })}
            />
            <AxisBottom
              top={innerHeight}
              scale={x}
              numTicks={4}
              // Sin esto, d3 rotula los meses en ingles.
              tickFormat={(value) => formatTick(value as Date)}
              stroke="var(--color-border)"
              tickStroke="var(--color-border)"
              tickLabelProps={() => ({
                fill: 'var(--color-text-muted)',
                fontSize: 10,
                textAnchor: 'middle',
              })}
            />
            {segments.map((segment) => (
              <LinePath
                key={segment[0]?.date}
                data={segment}
                x={(point) => x(dateOf(point.date))}
                y={(point) => y(point.value ?? min)}
                curve={curve === 'step' ? curveStepAfter : curveMonotoneX}
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
            {withValue.map((point) => (
              <circle
                key={point.date}
                cx={x(dateOf(point.date))}
                cy={y(point.value ?? min)}
                r={2.5}
                fill={color}
              />
            ))}
          </Group>
        );
      }}
    </ChartFrame>
  );
}

const TICK_FORMAT = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

function formatTick(value: Date): string {
  return TICK_FORMAT.format(value);
}

function dateOf(key: string | undefined): Date {
  if (!key) return new Date();
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);
}
