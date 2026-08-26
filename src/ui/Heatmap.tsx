import { useEffect, useRef } from 'react';
import { daysBetween, mondayOf, shiftDays, todayLocal } from '@/lib/date';
import styles from './Heatmap.module.css';

interface Props {
  /** Cuantos habitos se registraron como hechos cada dia. */
  doneByDate: Map<string, number>;
  /** Que dias tienen entrada, aunque no se hiciera nada. */
  registeredDates: Set<string>;
  /** Habitos activos, para saber cuanto es "el dia completo". */
  totalHabits: number;
  weeks?: number;
}

/**
 * Reticula de contribuciones. Ver docs/graficas/heatmap.md.
 *
 * Version reducida: faltan el tooltip, la tabla oculta de accesibilidad y las
 * etiquetas de mes, que llegan con la tarjeta completa.
 *
 * Vive en ui/ y no en features/charts porque es presentacional puro: recibe los
 * datos ya calculados y no consulta nada. Asi lo puede usar tanto el registro
 * diario como el historial sin que una feature importe de otra.
 */
export function Heatmap({ doneByDate, registeredDates, totalHabits, weeks = 18 }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const today = todayLocal();
  const start = mondayOf(shiftDays(today, -(weeks - 1) * 7));
  const total = weeks * 7;

  // El presente vive a la derecha: se abre por el final.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollLeft = node.scrollWidth;
  }, [weeks]);

  const cells = Array.from({ length: total }, (_, index) => {
    const date = shiftDays(start, index);
    const done = doneByDate.get(date) ?? 0;
    const registered = registeredDates.has(date);
    const future = daysBetween(today, date) > 0;
    const intensity = totalHabits > 0 ? Math.min(1, done / totalHabits) : 0;

    const classes = [styles.cell];
    if (future) classes.push(styles.future);
    else if (done > 0) classes.push(styles.registered);
    else if (registered) classes.push(styles.empty);
    if (date === today) classes.push(styles.today);

    return (
      <div
        key={date}
        className={classes.join(' ')}
        style={
          { '--intensity': String(Math.max(intensity, done > 0 ? 0.25 : 0)) } as React.CSSProperties
        }
      />
    );
  });

  const registeredCount = registeredDates.size;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.scroller}
        ref={scroller}
        role="img"
        aria-label={`Ultimas ${String(weeks)} semanas: ${String(registeredCount)} dias registrados`}
      >
        <div className={styles.grid}>{cells}</div>
      </div>
      <p className={styles.legend}>
        {registeredCount === 0
          ? 'Aún no hay días registrados'
          : `${String(registeredCount)} días registrados`}
      </p>
    </div>
  );
}
