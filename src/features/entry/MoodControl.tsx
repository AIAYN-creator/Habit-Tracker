import { useEffect, useState } from 'react';
import type { MoodDimension, MoodValue } from '@/data';
import styles from './HabitControl.module.css';

/** Las cinco caras, de peor a mejor. El valor guardado sigue siendo un 1 a 5. */
const FACES = [
  { value: 1, emoji: '😞', label: 'Muy mal' },
  { value: 2, emoji: '🙁', label: 'Mal' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '🙂', label: 'Bien' },
  { value: 5, emoji: '😄', label: 'Muy bien' },
] as const;

interface Props {
  dimension: MoodDimension;
  value: MoodValue | undefined;
  onSet: (value: MoodValue) => void;
  onClear: () => void;
}

/** Controles de las dimensiones de animo. Ver docs/producto/moods.md. */
export function MoodControl({ dimension, value, onSet, onClear }: Props) {
  const style = { '--habit-color': dimension.color } as React.CSSProperties;

  if (dimension.type === 'scale' && dimension.display?.input === 'faces') {
    return (
      <div className={styles.rowColumn} style={style}>
        <span className={styles.name}>{dimension.name}</span>
        <div className={styles.faces} role="radiogroup" aria-label={dimension.name}>
          {FACES.map((face) => {
            const selected = value === face.value;
            return (
              <button
                key={face.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={face.label}
                className={styles.face}
                onClick={() => {
                  if (selected) onClear();
                  else onSet(face.value);
                }}
              >
                <span aria-hidden="true">{face.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (dimension.type === 'scale') {
    const max = dimension.config.max ?? 5;
    const labels = dimension.config.labels ?? [];
    return (
      <div className={styles.row} style={style}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.name}>
          {dimension.name}
          {labels.length === 2 ? (
            <span className={styles.extremes}>
              {labels[0]} → {labels[1]}
            </span>
          ) : null}
        </span>
        <div className={styles.scale} role="radiogroup" aria-label={dimension.name}>
          {Array.from({ length: max }, (_, index) => index + 1).map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.segment}
                onClick={() => {
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

  if (dimension.type === 'tags') {
    const selected = Array.isArray(value) ? value : [];
    // Las sugerencias no son una restriccion: se muestran las configuradas y
    // tambien las que ya se escribieron alguna vez.
    const options = [...new Set([...(dimension.config.options ?? []), ...selected])];
    return (
      <div className={styles.rowColumn} style={style}>
        <span className={styles.name}>{dimension.name}</span>
        <div className={styles.tags}>
          {options.map((tag) => {
            const on = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                className={styles.tag}
                onClick={() => {
                  const next = on ? selected.filter((item) => item !== tag) : [...selected, tag];
                  if (next.length === 0) onClear();
                  else onSet(next);
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return <NoteControl dimension={dimension} value={value} onSet={onSet} onClear={onClear} />;
}

function NoteControl({ dimension, value, onSet, onClear }: Props) {
  // El estado arranca del valor guardado y no se sincroniza por efecto: quien
  // llama monta este componente con una clave que incluye el dia, asi que al
  // cambiar de dia se remonta con el valor correcto.
  const [draft, setDraft] = useState(typeof value === 'string' ? value : '');

  // Con retardo: no tiene sentido encolar una escritura por cada tecla.
  useEffect(() => {
    const current = typeof value === 'string' ? value : '';
    if (draft === current) return;
    const timer = setTimeout(() => {
      if (draft.trim().length === 0) onClear();
      else onSet(draft);
    }, 800);
    return () => {
      clearTimeout(timer);
    };
  }, [draft, value, onSet, onClear]);

  return (
    <div className={styles.rowColumn}>
      <label className={styles.name} htmlFor={`note-${dimension.id}`}>
        {dimension.name}
      </label>
      <textarea
        id={`note-${dimension.id}`}
        className={styles.note}
        rows={2}
        value={draft}
        placeholder="Lo que quieras recordar del día…"
        onChange={(event) => {
          setDraft(event.target.value);
        }}
      />
    </div>
  );
}
