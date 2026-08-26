import { Button } from '@/ui';
import type { Habit, HabitValue } from '@/data';
import styles from './HabitControl.module.css';

interface Props {
  habit: Habit;
  value: HabitValue | undefined;
  onSet: (value: HabitValue) => void;
  onClear: () => void;
}

/**
 * Un control por tipo de dato. Ver docs/diseno/inputs.md.
 *
 * Los tres estados del modelo se pueden expresar: sin clave (no registrado),
 * valor falso o cero (registrado y no hecho) y valor. Volver a tocar lo
 * seleccionado borra la clave, no escribe cero.
 */
export function HabitControl({ habit, value, onSet, onClear }: Props) {
  const style = { '--habit-color': habit.color } as React.CSSProperties;

  if (habit.type === 'boolean') {
    const checked = value === true;
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.row}
        style={style}
        onClick={() => {
          if (checked) onClear();
          else onSet(true);
        }}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.name}>{habit.name}</span>
      </button>
    );
  }

  if (habit.type === 'scale') {
    const max = habit.config.max ?? 5;
    const values = Array.from({ length: max }, (_, index) => index + 1);
    return (
      <div className={styles.row} style={style}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.name}>{habit.name}</span>
        <div className={styles.scale} role="radiogroup" aria-label={habit.name}>
          {values.map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.segment}
                onClick={() => {
                  // Volver a tocar lo seleccionado deja el dia sin registrar.
                  if (selected) onClear();
                  else onSet(option);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const step = habit.config.step ?? 1;
  const current = typeof value === 'number' ? value : 0;
  const unit = habit.config.unit ?? '';

  return (
    <div className={styles.row} style={style}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.name}>{habit.name}</span>
      <div className={styles.stepper}>
        <Button
          size="sm"
          aria-label={`Restar ${String(step)} a ${habit.name}`}
          onClick={() => {
            const next = current - step;
            if (next <= 0) onClear();
            else onSet(next);
          }}
        >
          −
        </Button>
        <span className={styles.count} aria-live="polite">
          {typeof value === 'number' ? `${String(value)}${unit ? ` ${unit}` : ''}` : '–'}
        </span>
        <Button
          size="sm"
          aria-label={`Sumar ${String(step)} a ${habit.name}`}
          onClick={() => {
            onSet(current + step);
          }}
        >
          +
        </Button>
      </div>
    </div>
  );
}
