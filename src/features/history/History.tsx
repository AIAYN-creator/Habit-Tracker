import { useState } from 'react';
import {
  entries,
  isDone,
  schema,
  summarize,
  useLiveQuery,
  type DateKey,
  type Entry,
  type Habit,
} from '@/data';
import { formatLongDate, mondayOf, shiftDays, todayLocal, toLocalDateKey } from '@/lib/date';
import { Button } from '@/ui';
import styles from './History.module.css';

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

interface Props {
  onPick: (date: DateKey) => void;
}

/**
 * Historial en calendario y en lista, dos vistas del mismo dato.
 * Ver docs/producto/calendario.md y docs/producto/lista.md.
 */
export function History({ onPick }: Props) {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState(() => todayLocal().slice(0, 7));

  const habits = useLiveQuery(() => schema.listHabits(), []);
  const from = `${month}-01`;
  const to = lastDayOf(month);
  const monthEntries = useLiveQuery(() => entries.range(from, to), [from, to]);
  const recent = useLiveQuery(() => entries.range('0000-01-01', todayLocal()), []);

  const byDate = new Map((monthEntries ?? []).map((entry) => [entry.date, entry]));
  const currentMonth = todayLocal().slice(0, 7);

  return (
    <main className={styles.screen}>
      <div className={styles.head}>
        {view === 'calendar' ? (
          <>
            <Button
              size="sm"
              aria-label="Mes anterior"
              onClick={() => {
                setMonth(shiftMonth(month, -1));
              }}
            >
              ←
            </Button>
            <h1 className={styles.month}>{monthName(month)}</h1>
            <Button
              size="sm"
              aria-label="Mes siguiente"
              disabled={month >= currentMonth}
              onClick={() => {
                setMonth(shiftMonth(month, 1));
              }}
            >
              →
            </Button>
          </>
        ) : (
          <h1 className={styles.month}>Historial</h1>
        )}
        <div className={styles.toggle}>
          <Button
            size="sm"
            variant={view === 'calendar' ? 'primary' : 'ghost'}
            onClick={() => {
              setView('calendar');
            }}
          >
            Mes
          </Button>
          <Button
            size="sm"
            variant={view === 'list' ? 'primary' : 'ghost'}
            onClick={() => {
              setView('list');
            }}
          >
            Lista
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <Calendar month={month} byDate={byDate} habits={habits ?? []} onPick={onPick} />
      ) : (
        <List days={recent} habits={habits ?? []} onPick={onPick} />
      )}
    </main>
  );
}

function Calendar({
  month,
  byDate,
  habits,
  onPick,
}: {
  month: string;
  byDate: Map<string, Entry>;
  habits: Habit[];
  onPick: (date: DateKey) => void;
}) {
  const today = todayLocal();
  const first = `${month}-01`;
  const start = mondayOf(first);
  const end = lastDayOf(month);
  const cells: DateKey[] = [];
  for (let date = start; date <= end || cells.length % 7 !== 0; date = shiftDays(date, 1)) {
    cells.push(date);
    if (cells.length > 42) break;
  }

  return (
    <div className={styles.grid} role="grid" aria-label={monthName(month)}>
      {WEEKDAYS.map((day) => (
        <div key={day} className={styles.weekday} role="columnheader">
          {day}
        </div>
      ))}
      {cells.map((date) => {
        const outside = date.slice(0, 7) !== month;
        const future = date > today;
        const summary = summarize(habits, byDate.get(date), date);
        const label = `${formatLongDate(date)}: ${
          summary.registered
            ? `${String(summary.done)} de ${String(summary.expected)} registrados`
            : 'sin registrar'
        }`;

        return (
          <button
            key={date}
            type="button"
            role="gridcell"
            className={[styles.day, date === today ? styles.today : ''].filter(Boolean).join(' ')}
            style={{ visibility: outside ? 'hidden' : undefined }}
            disabled={future || outside}
            aria-label={label}
            onClick={() => {
              onPick(date);
            }}
          >
            <span>{Number(date.slice(-2))}</span>
            {future ? (
              <span className={styles.ringNone} />
            ) : summary.registered ? (
              <span
                className={styles.ring}
                style={{ '--ratio': String(summary.ratio) } as React.CSSProperties}
              />
            ) : summary.expected > 0 ? (
              <span className={styles.ringEmpty} />
            ) : (
              <span className={styles.ringNone} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function List({
  days,
  habits,
  onPick,
}: {
  days: Entry[] | undefined;
  habits: Habit[];
  onPick: (date: DateKey) => void;
}) {
  if (days === undefined) return null;
  // Los dias sin registrar no se listan: el hueco se percibe por el salto de fechas.
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));

  if (sorted.length === 0) {
    return <p className={styles.empty}>Todavía no hay días registrados.</p>;
  }

  const byId = new Map(habits.map((habit) => [habit.id, habit]));

  return (
    <div className={styles.list}>
      {sorted.map((entry) => {
        const done = Object.entries(entry.habits)
          .filter(([, value]) => isDone(value))
          .map(([id, value]) => {
            const habit = byId.get(id);
            if (!habit) return null;
            if (habit.type === 'boolean') return habit.name;
            const unit = habit.config.unit ? ` ${habit.config.unit}` : '';
            return `${habit.name} ${String(value)}${unit}`;
          })
          .filter((text): text is string => text !== null);

        return (
          <button
            key={entry.date}
            type="button"
            className={styles.item}
            onClick={() => {
              onPick(entry.date);
            }}
          >
            <span className={styles.itemHead}>
              <span className={styles.itemDate}>{formatLongDate(entry.date)}</span>
              <span className={styles.itemSummary}>
                {done.length > 0 ? done.join(' · ') : 'Sin nada marcado'}
              </span>
            </span>
            {entry.note ? <span className={styles.itemNote}>{entry.note}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function lastDayOf(month: string): string {
  const [year, index] = month.split('-').map(Number);
  return toLocalDateKey(new Date(year ?? 2026, index ?? 1, 0));
}

function shiftMonth(month: string, delta: number): string {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(year ?? 2026, (index ?? 1) - 1 + delta, 1);
  return toLocalDateKey(date).slice(0, 7);
}

function monthName(month: string): string {
  const [year, index] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(year ?? 2026, (index ?? 1) - 1, 1),
  );
}
