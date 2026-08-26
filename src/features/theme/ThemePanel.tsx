import {
  contrastRatio,
  db,
  DEFAULT_APPEARANCE,
  loadFixture,
  readAppearance,
  saveAppearance,
  saveDensity,
  schema,
  useLiveQuery,
  type Appearance,
  type Density,
} from '@/data';
import { Button } from '@/ui';
import { applyAppearance, applyDensity } from './theme';
import styles from './ThemePanel.module.css';

const ACCENTS = ['#0d7dd4', '#e07a5f', '#81b29a', '#9d6bd4', '#c9184a', '#5f797b'] as const;

const THEMES: { value: Appearance['theme']; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

const FONTS: { value: Appearance['font']; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
];

/**
 * Aqui el diferenciador deja de ser una propiedad del codigo y se convierte en
 * algo que el usuario toca. Ver docs/diseno/panel-tema.md.
 *
 * Sin vista previa aparte: los cambios se aplican en el momento sobre la app
 * que se ve detras, que es la unica prueba que importa.
 */
export function ThemePanel() {
  const stored = useLiveQuery(() => db.settings.get('appearance'), []);
  const storedDensity = useLiveQuery(() => db.settings.get('density'), []);

  const appearance = readAppearance(stored?.value);
  const density: Density = storedDensity?.value === 'compact' ? 'compact' : 'comfortable';

  function update(patch: Partial<Appearance>) {
    const next = { ...appearance, ...patch };
    applyAppearance(next);
    void saveAppearance(next);
  }

  const habits = useLiveQuery(() => schema.listActiveHabits(), []);

  /**
   * El tipo de grafica se responde por metrica, asi que vive en el schema y no
   * en estas preferencias. Solo se ofrece donde hay eleccion real: una escala
   * no se dibuja como heatmap de intensidad, porque un 3 sobre 5 no es "mas
   * intenso" que un 2, es distinto.
   */
  const metrics = (habits ?? []).filter(
    (habit) => habit.type === 'counter' || habit.type === 'duration',
  );

  const background = appearance.theme === 'dark' ? '#162330' : '#ffffff';
  const ratio = contrastRatio(appearance.accent, background);
  const poor = ratio < 4.5;

  return (
    <div className={styles.panel}>
      <Group title="Tema">
        {THEMES.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={appearance.theme === option.value ? 'primary' : 'ghost'}
            onClick={() => {
              update({ theme: option.value });
            }}
          >
            {option.label}
          </Button>
        ))}
      </Group>

      <div className={styles.group}>
        <p className={styles.title}>Color de acento</p>
        <div className={styles.colors}>
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              className={styles.color}
              style={{ background: color }}
              aria-label={`Acento ${color}`}
              aria-pressed={appearance.accent === color}
              onClick={() => {
                update({ accent: color });
              }}
            />
          ))}
        </div>
        {poor ? (
          <p className={styles.warn}>
            Este color tiene poco contraste sobre el fondo ({ratio.toFixed(1)}:1). Puedes usarlo
            igual, pero el texto se leerá peor.
          </p>
        ) : null}
      </div>

      <Group title="Tipografía">
        {FONTS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={appearance.font === option.value ? 'primary' : 'ghost'}
            onClick={() => {
              update({ font: option.value });
            }}
          >
            {option.label}
          </Button>
        ))}
      </Group>

      <div className={styles.group}>
        <p className={styles.title}>Densidad</p>
        <div className={styles.row}>
          {(['comfortable', 'compact'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={density === option ? 'primary' : 'ghost'}
              onClick={() => {
                applyDensity(option);
                void saveDensity(option);
              }}
            >
              {option === 'comfortable' ? 'Cómoda' : 'Compacta'}
            </Button>
          ))}
        </div>
        <p className={styles.hint}>
          La densidad es de este dispositivo y no viaja: lo que va bien en un móvil no va bien en un
          monitor.
        </p>
      </div>

      <div className={styles.group}>
        <p className={styles.title}>Gráficas</p>
        <div className={styles.row}>
          <Button
            size="sm"
            variant={appearance.chartCurve === 'smooth' ? 'primary' : 'ghost'}
            onClick={() => {
              update({ chartCurve: 'smooth' });
            }}
          >
            Línea suave
          </Button>
          <Button
            size="sm"
            variant={appearance.chartCurve === 'step' ? 'primary' : 'ghost'}
            onClick={() => {
              update({ chartCurve: 'step' });
            }}
          >
            Escalonada
          </Button>
        </div>
        <div className={styles.row}>
          <Button
            size="sm"
            variant={appearance.chartGrid ? 'primary' : 'ghost'}
            onClick={() => {
              update({ chartGrid: !appearance.chartGrid });
            }}
          >
            {appearance.chartGrid ? 'Con rejilla' : 'Sin rejilla'}
          </Button>
          <Button
            size="sm"
            variant={appearance.cellRadius === 'rounded' ? 'primary' : 'ghost'}
            onClick={() => {
              update({ cellRadius: appearance.cellRadius === 'rounded' ? 'sharp' : 'rounded' });
            }}
          >
            {appearance.cellRadius === 'rounded' ? 'Celdas redondas' : 'Celdas cuadradas'}
          </Button>
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className={styles.group}>
          <p className={styles.title}>Cómo se dibuja cada métrica</p>
          {metrics.map((habit) => {
            const current = habit.display?.chart ?? 'bars';
            return (
              <div key={habit.id} className={styles.metric}>
                <span className={styles.metricName}>{habit.name}</span>
                <div className={styles.row}>
                  {(['bars', 'line', 'heatmap'] as const).map((chart) => (
                    <Button
                      key={chart}
                      size="sm"
                      variant={current === chart ? 'primary' : 'ghost'}
                      onClick={() => {
                        void schema.updateHabit(habit.id, { display: { ...habit.display, chart } });
                      }}
                    >
                      {{ bars: 'Barras', line: 'Línea', heatmap: 'Heatmap' }[chart]}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <Group title="Movimiento">
        <Button
          size="sm"
          variant={appearance.motion ? 'primary' : 'ghost'}
          onClick={() => {
            update({ motion: true });
          }}
        >
          Con animaciones
        </Button>
        <Button
          size="sm"
          variant={appearance.motion ? 'ghost' : 'primary'}
          onClick={() => {
            update({ motion: false });
          }}
        >
          Sin animaciones
        </Button>
      </Group>

      <Button
        onClick={() => {
          update(DEFAULT_APPEARANCE);
        }}
      >
        Restablecer
      </Button>

      {import.meta.env.DEV ? (
        <div className={styles.group}>
          <p className={styles.title}>Desarrollo</p>
          <Button
            variant="danger"
            onClick={() => {
              // Vacia la base antes: una base mitad real mitad sintetica es
              // imposible de razonar, y borrar lo real por accidente seria el
              // peor resultado de una herramienta de desarrollo.
              if (window.confirm('Esto borra todos los datos locales y carga datos de ejemplo.')) {
                void loadFixture();
              }
            }}
          >
            Cargar datos de ejemplo
          </Button>
          <p className={styles.hint}>Sólo en desarrollo: no aparece en el build de producción.</p>
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.group}>
      <p className={styles.title}>{title}</p>
      <div className={styles.row}>{children}</div>
    </div>
  );
}
