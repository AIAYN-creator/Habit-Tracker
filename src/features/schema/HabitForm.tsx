import { useState } from 'react';
import { schema, useLiveQuery, type Frequency, type Habit, type HabitType } from '@/data';
import { Button, Field, Input } from '@/ui';
import styles from './HabitForm.module.css';

const PALETTE = ['#e07a5f', '#3d5a80', '#81b29a', '#f2cc8f', '#9d8189', '#5f797b'] as const;

/**
 * Alta de habitos. Ver docs/producto/habitos.md.
 *
 * El tipo se elige al crear y no se puede cambiar despues: lo prohibe el
 * modelo, porque las entradas ya registradas dejarian de tener sentido.
 */
const TYPES: { value: HabitType; name: string; example: string }[] = [
  { value: 'boolean', name: 'Sí o no', example: '¿Lo hiciste?' },
  { value: 'counter', name: 'Contador', example: '¿Cuántas veces?' },
  { value: 'duration', name: 'Duración', example: '¿Cuánto tiempo?' },
  { value: 'scale', name: 'Escala', example: 'Del 1 al 5' },
];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: { kind: 'daily' }, label: 'Cada día' },
  { value: { kind: 'weekly', times: 3 }, label: '3 por semana' },
  { value: { kind: 'weekdays', days: [1, 2, 3, 4, 5] }, label: 'Entre semana' },
  { value: { kind: 'none' }, label: 'Sin expectativa' },
];

export function HabitForm({ onDone }: { onDone: () => void }) {
  const habits = useLiveQuery(() => schema.listActiveHabits(), []);
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');
  const [max, setMax] = useState('5');
  const [frequency, setFrequency] = useState(0);
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [error, setError] = useState<string | undefined>(undefined);

  const numeric = type === 'counter' || type === 'duration';

  async function submit() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Ponle un nombre.');
      return;
    }
    const upper = Number(max);
    if (type === 'scale' && (!Number.isInteger(upper) || upper < 2 || upper > 10)) {
      setError('La escala va de 1 a un máximo entre 2 y 10.');
      return;
    }

    await schema.createHabit({
      name: trimmed,
      type,
      config: numeric
        ? {
            unit: type === 'duration' ? 'min' : unit.trim() || undefined,
            step: type === 'duration' ? 5 : 1,
            target: target.trim().length > 0 ? Number(target) : undefined,
          }
        : type === 'scale'
          ? { min: 1, max: upper, step: 1 }
          : {},
      frequency: FREQUENCIES[frequency]?.value ?? { kind: 'daily' },
      color,
    });
    onDone();
  }

  return (
    <div className={styles.form}>
      <Field label="Nombre" error={error}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={name}
            placeholder="Correr, leer, beber agua…"
            onChange={(event) => {
              setName(event.target.value);
              setError(undefined);
            }}
          />
        )}
      </Field>

      <div>
        <p className={styles.sectionTitle}>Qué se mide</p>
        <div className={styles.types}>
          {TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.type}
              aria-pressed={type === option.value}
              onClick={() => {
                setType(option.value);
              }}
            >
              <span className={styles.typeName}>{option.name}</span>
              <span className={styles.typeExample}>{option.example}</span>
            </button>
          ))}
        </div>
      </div>

      {numeric ? (
        <div className={styles.inline}>
          {type === 'counter' ? (
            <Field label="Unidad" hint="Opcional">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={unit}
                  placeholder="vasos, páginas…"
                  onChange={(event) => {
                    setUnit(event.target.value);
                  }}
                />
              )}
            </Field>
          ) : null}
          <Field label="Objetivo" hint={type === 'duration' ? 'Minutos' : 'Opcional'}>
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                inputMode="numeric"
                value={target}
                onChange={(event) => {
                  setTarget(event.target.value);
                }}
              />
            )}
          </Field>
        </div>
      ) : null}

      {type === 'scale' ? (
        <Field label="Máximo de la escala" hint="Del 1 a este número">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              inputMode="numeric"
              value={max}
              onChange={(event) => {
                setMax(event.target.value);
              }}
            />
          )}
        </Field>
      ) : null}

      <div>
        <p className={styles.sectionTitle}>Cada cuánto</p>
        <div className={styles.types}>
          {FREQUENCIES.map((option, index) => (
            <button
              key={option.label}
              type="button"
              className={styles.type}
              aria-pressed={frequency === index}
              onClick={() => {
                setFrequency(index);
              }}
            >
              <span className={styles.typeName}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={styles.sectionTitle}>Color</p>
        <div className={styles.colors}>
          {PALETTE.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.color}
              style={{ background: option }}
              aria-label={`Color ${option}`}
              aria-pressed={color === option}
              onClick={() => {
                setColor(option);
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => void submit()}>
          Crear hábito
        </Button>
      </div>

      {habits && habits.length > 0 ? (
        <div className={styles.existing}>
          <p className={styles.sectionTitle}>Hábitos activos</p>
          {habits.map((habit: Habit) => (
            <div key={habit.id} className={styles.existingRow}>
              <span className={styles.existingName}>{habit.name}</span>
              <Button size="sm" variant="danger" onClick={() => void schema.archiveHabit(habit.id)}>
                Archivar
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
