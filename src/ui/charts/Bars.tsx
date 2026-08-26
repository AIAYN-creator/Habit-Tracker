import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { ChartFrame } from './ChartFrame';
import { formatDuration } from './format';
import { MARGIN, type Size } from './geometry';

export interface Bucket {
  label: string;
  /** Suma del intervalo. */
  value: number;
  /** El periodo en curso todavia no ha terminado. */
  partial?: boolean;
}

interface Props {
  title: string;
  buckets: Bucket[];
  color: string;
  /** Objetivo ya escalado al intervalo. */
  target?: number;
  unit?: string;
  grouping: string;
  grid?: boolean;
}

/**
 * Barras para contadores y duraciones. Ver docs/graficas/barras.md.
 *
 * Ningun color codifica juicio: cumplir o no un habito no es aprobar o
 * suspender, y el verde y el rojo en una app de seguimiento personal
 * envejecen mal. Solo el color del habito, pleno o atenuado.
 */
export function Bars({ title, buckets, color, target, unit, grouping, grid }: Props) {
  const empty = buckets.every((bucket) => bucket.value === 0);
  const format = unit === 'min' ? formatDuration : (value: number) => String(value);

  const table = (
    <table>
      <caption>{title}</caption>
      <tbody>
        {buckets.map((bucket) => (
          <tr key={bucket.label}>
            <th scope="row">{bucket.label}</th>
            <td>{format(bucket.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);

  return (
    <ChartFrame
      title={title}
      label={`${title}: ${format(total)} en total, ${grouping}`}
      empty={empty}
      table={table}
      footer={grouping}
    >
      {({ width, height }: Size) => {
        const innerWidth = width - MARGIN.left - MARGIN.right;
        const innerHeight = height - MARGIN.top - MARGIN.bottom;
        const top = Math.max(...buckets.map((bucket) => bucket.value), target ?? 0, 1);

        const x = scaleBand({
          domain: buckets.map((bucket) => bucket.label),
          range: [0, innerWidth],
          padding: 0.25,
        });
        const y = scaleLinear({ domain: [0, top], range: [innerHeight, 0], nice: true });

        return (
          <Group left={MARGIN.left} top={MARGIN.top}>
            {grid ? (
              <GridRows scale={y} width={innerWidth} numTicks={3} stroke="var(--color-border)" />
            ) : null}
            <AxisLeft
              scale={y}
              numTicks={3}
              stroke="var(--color-border)"
              tickStroke="var(--color-border)"
              tickFormat={(value) => format(Number(value))}
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
              numTicks={Math.min(buckets.length, 6)}
              stroke="var(--color-border)"
              tickStroke="var(--color-border)"
              tickLabelProps={() => ({
                fill: 'var(--color-text-muted)',
                fontSize: 10,
                textAnchor: 'middle',
              })}
            />
            {buckets.map((bucket) => {
              const barHeight = bucket.value === 0 ? 0 : innerHeight - y(bucket.value);
              return (
                <Bar
                  key={bucket.label}
                  x={x(bucket.label) ?? 0}
                  y={innerHeight - barHeight}
                  width={x.bandwidth()}
                  height={barHeight}
                  rx={2}
                  fill={color}
                  // El periodo en curso, atenuado: aun no ha terminado, y sin
                  // esto parece que va peor de lo que va.
                  opacity={bucket.partial ? 0.45 : 1}
                />
              );
            })}
            {target !== undefined && target > 0 ? (
              <line
                x1={0}
                x2={innerWidth}
                y1={y(target)}
                y2={y(target)}
                stroke="var(--color-text-muted)"
                strokeDasharray="4 3"
                strokeWidth={1}
              />
            ) : null}
          </Group>
        );
      }}
    </ChartFrame>
  );
}
