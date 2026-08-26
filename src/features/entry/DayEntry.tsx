import { useState } from 'react';
import { entries, schema, useLiveQuery, type HabitValue } from '@/data';
import { formatLongDate, mondayOf, shiftDays, todayLocal } from '@/lib/date';
import { Button, Heatmap } from '@/ui';
import { HabitControl } from './HabitControl';
import styles from './DayEntry.module.css';

/**
 * Registro del dia. Ver docs/producto/entrada.md.
 *
 * Sin boton de guardar: cada interaccion escribe en el momento. La misma
 * pantalla sirve para hoy y para editar un dia pasado.
 */
export function DayEntry({ onManage }: { onManage: () => void }) {
  const [date, setDate] = useState(todayLocal());

  const habits = useLiveQuery(() => schema.listActiveHabits(), []);
  const entry = useLiveQuery(() => entries.get(date), [date]);

  const WEEKS = 18;
  const from = mondayOf(shiftDays(todayLocal(), -(WEEKS - 1) * 7));
  const recent = useLiveQuery(() => entries.range(from, todayLocal()), [from]);

  const doneByDate = new Map<string, number>();
  const registeredDates = new Set<string>();
  for (const day of recent ?? []) {
    registeredDates.add(day.date);
    const done = Object.values(day.habits).filter((value) => value !== false && value !== 0).length;
    doneByDate.set(day.date, done);
  }

  const isToday = date === todayLocal();
  // useLiveQuery devuelve undefined mientras carga: no es lo mismo que vacio.
  const loading = habits === undefined;

  function setValue(id: string, value: HabitValue) {
    void entries.setValue(date, 'habits', id, value);
  }

  function clearValue(id: string) {
    void entries.clearValue(date, 'habits', id);
  }

  return (
    <main className={styles.screen}>
      <div className={styles.sticky}>
        <header className={styles.header}>
          <Button
            size="sm"
            aria-label="Dia anterior"
            onClick={() => {
              setDate(shiftDays(date, -1));
            }}
          >
            ←
          </Button>
          <h1 className={styles.date}>{formatLongDate(date)}</h1>
          {isToday ? null : (
            <Button
              size="sm"
              onClick={() => {
                setDate(todayLocal());
              }}
            >
              Hoy
            </Button>
          )}
          {/* No se navega al futuro: registrar el jueves que viene no significa nada. */}
          <Button
            size="sm"
            aria-label="Dia siguiente"
            disabled={isToday}
            onClick={() => {
              setDate(shiftDays(date, 1));
            }}
          >
            →
          </Button>
        </header>

        <Heatmap
          doneByDate={doneByDate}
          registeredDates={registeredDates}
          totalHabits={habits?.length ?? 0}
          weeks={WEEKS}
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hábitos</h2>

        {loading ? null : habits.length === 0 ? (
          <p className={styles.empty}>
            Todavía no sigues ningún hábito. Añade el primero aquí abajo.
          </p>
        ) : (
          habits.map((habit) => (
            <HabitControl
              key={habit.id}
              habit={habit}
              value={entry?.habits[habit.id]}
              onSet={(value) => {
                setValue(habit.id, value);
              }}
              onClear={() => {
                clearValue(habit.id);
              }}
            />
          ))
        )}

        <Button variant="primary" onClick={onManage}>
          Añadir o gestionar hábitos
        </Button>
      </section>
    </main>
  );
}
