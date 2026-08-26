import { useState } from 'react';
import { entries, schema, useLiveQuery } from '@/data';
import { daysBetween, shiftDays, todayLocal } from '@/lib/date';
import { Bars, Button, EmptyState, Series, type Point } from '@/ui';
import { bucketize, groupingFor, groupingLabel, targetFactor } from './bucketing';
import styles from './ChartsView.module.css';

/** `null` es todo el tiempo: desde el primer dia registrado. */
const RANGES: { days: number | null; label: string }[] = [
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: 'Año' },
  { days: null, label: 'Todo' },
];

/** Una gráfica por métrica, del tipo que le corresponde. */
export function ChartsView() {
  const [days, setDays] = useState<number | null>(30);
  const habits = useLiveQuery(() => schema.listActiveHabits(), []);
  const moods = useLiveQuery(() => schema.listActiveMoods(), []);
  const oldest = useLiveQuery(() => entries.firstDate(), []);

  const to = todayLocal();
  // Con "Todo", el rango arranca en el primer dia registrado. Sin datos
  // todavia, se comporta como el mes: no tiene sentido un eje vacio de años.
  const from = days === null ? (oldest?.date ?? shiftDays(to, -29)) : shiftDays(to, -(days - 1));
  const span = daysBetween(from, to) + 1;
  const range = useLiveQuery(() => entries.range(from, to), [from, to]);

  const grouping = groupingFor(span);
  const byDate = new Map((range ?? []).map((entry) => [entry.date, entry]));

  const series = (key: 'habits' | 'moods', id: string): Point[] => {
    const points: Point[] = [];
    for (let date = from; date <= to; date = shiftDays(date, 1)) {
      const value = byDate.get(date)?.[key][id];
      points.push({ date, value: typeof value === 'number' ? value : null });
    }
    return points;
  };

  const sums = (id: string): Map<string, number> => {
    const values = new Map<string, number>();
    for (const [date, entry] of byDate) {
      const value = entry.habits[id];
      if (typeof value === 'number') values.set(date, value);
    }
    return values;
  };

  const numeric = (habits ?? []).filter(
    (habit) => habit.type === 'counter' || habit.type === 'duration',
  );
  const scales = (habits ?? []).filter((habit) => habit.type === 'scale');
  const moodScales = (moods ?? []).filter((dimension) => dimension.type === 'scale');
  const nothing = numeric.length + scales.length + moodScales.length === 0;

  return (
    <main className={styles.screen}>
      <div className={styles.head}>
        <h1 className={styles.title}>Gráficas</h1>
        <div className={styles.ranges}>
          {RANGES.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={days === option.days ? 'primary' : 'ghost'}
              onClick={() => {
                setDays(option.days);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {nothing ? (
        <EmptyState
          kind="chart"
          title="Aún no hay nada que dibujar"
          hint="Las gráficas salen de los contadores, las duraciones y las escalas."
        />
      ) : null}

      {numeric.map((habit) => (
        <Bars
          key={habit.id}
          title={habit.name}
          color={habit.color}
          unit={habit.config.unit}
          grouping={groupingLabel(grouping)}
          target={
            habit.config.target === undefined
              ? undefined
              : habit.config.target * targetFactor(grouping)
          }
          buckets={bucketize(sums(habit.id), from, to, grouping)}
        />
      ))}

      {scales.map((habit) => (
        <Series
          key={habit.id}
          title={habit.name}
          color={habit.color}
          min={habit.config.min ?? 1}
          max={habit.config.max ?? 5}
          points={series('habits', habit.id)}
        />
      ))}

      {moodScales.map((dimension) => (
        <Series
          key={dimension.id}
          title={dimension.name}
          color={dimension.color}
          min={dimension.config.min ?? 1}
          max={dimension.config.max ?? 5}
          labels={
            dimension.config.labels?.length === 2
              ? [dimension.config.labels[0] ?? '', dimension.config.labels[1] ?? '']
              : undefined
          }
          points={series('moods', dimension.id)}
        />
      ))}
    </main>
  );
}
