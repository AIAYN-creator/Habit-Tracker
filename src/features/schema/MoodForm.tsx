import { useState } from 'react';
import { schema, useLiveQuery, type MoodDimension, type MoodType } from '@/data';
import { Button, Field, Input } from '@/ui';
import styles from './HabitForm.module.css';

const PALETTE = ['#3d5a80', '#81b29a', '#e07a5f', '#9d8189', '#f2cc8f', '#5f797b'] as const;

const TYPES: { value: MoodType; name: string; example: string }[] = [
  { value: 'scale', name: 'Escala', example: 'Del 1 al 5' },
  { value: 'tags', name: 'Etiquetas', example: 'Social, ansioso…' },
  { value: 'note', name: 'Nota', example: 'Texto libre' },
];

/**
 * Alta de dimensiones de animo. Ver docs/producto/moods.md.
 *
 * El multi-eje no es un tipo: son dos escalas conviviendo, asi que aqui no
 * aparece como opcion.
 */
export function MoodForm({ onDone }: { onDone: () => void }) {
  const dimensions = useLiveQuery(() => schema.listActiveMoods(), []);
  const [name, setName] = useState('');
  const [type, setType] = useState<MoodType>('scale');
  const [max, setMax] = useState('5');
  const [low, setLow] = useState('');
  const [high, setHigh] = useState('');
  const [options, setOptions] = useState('');
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [error, setError] = useState<string | undefined>(undefined);

  const many = (dimensions?.length ?? 0) >= 3;

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

    await schema.createMood({
      name: trimmed,
      type,
      config:
        type === 'scale'
          ? {
              min: 1,
              max: upper,
              labels: low.trim() || high.trim() ? [low.trim(), high.trim()] : undefined,
            }
          : type === 'tags'
            ? {
                options: options
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              }
            : {},
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
            placeholder="Energía, ánimo, sueño…"
            onChange={(event) => {
              setName(event.target.value);
              setError(undefined);
            }}
          />
        )}
      </Field>

      <div className={styles.group}>
        <p className={styles.sectionTitle}>Cómo se registra</p>
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

      {type === 'scale' ? (
        <>
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
          <div className={styles.inline}>
            <Field label="El mínimo es" hint="Agotado, fatal…">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={low}
                  onChange={(event) => {
                    setLow(event.target.value);
                  }}
                />
              )}
            </Field>
            <Field label="El máximo es" hint="Pletórico, genial…">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  value={high}
                  onChange={(event) => {
                    setHigh(event.target.value);
                  }}
                />
              )}
            </Field>
          </div>
          <p className={styles.dayHint}>
            Poner nombre a los extremos cuesta diez segundos y hace que tus datos sigan siendo
            comparables dentro de un año.
          </p>
        </>
      ) : null}

      {type === 'tags' ? (
        <Field label="Sugerencias" hint="Separadas por comas. Siempre podrás escribir otras.">
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              value={options}
              placeholder="social, productivo, ansioso"
              onChange={(event) => {
                setOptions(event.target.value);
              }}
            />
          )}
        </Field>
      ) : null}

      <div className={styles.group}>
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

      {many ? (
        <p className={styles.dayHint}>
          Con más de tres dimensiones el registro diario empieza a pesar. Nada lo impide, pero
          conviene saberlo.
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => void submit()}>
          Crear dimensión
        </Button>
      </div>

      {dimensions && dimensions.length > 0 ? (
        <div className={styles.existing}>
          <p className={styles.sectionTitle}>Dimensiones activas</p>
          {dimensions.map((dimension: MoodDimension) => (
            <div key={dimension.id} className={styles.existingRow}>
              <span className={styles.existingName}>{dimension.name}</span>
              <Button
                size="sm"
                variant="danger"
                onClick={() => void schema.archiveMood(dimension.id)}
              >
                Archivar
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
