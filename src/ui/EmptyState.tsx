import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type Kind = 'habits' | 'chart' | 'history' | 'offline';

interface Props {
  kind: Kind;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/**
 * Ilustraciones de estado vacio. Ver docs/diseno/iconos.md.
 *
 * Mismo lenguaje geometrico que el logo: composiciones de las celdas del
 * heatmap. Sale un sistema reconocible sin necesidad de talento ilustrativo,
 * que es la forma honesta de resolver esto.
 *
 * Sin personajes ni caras: una app que se abre todos los dias durante años no
 * debe hacer un chiste cada vez que falta un dato.
 */
export function EmptyState({ kind, title, hint, action }: Props) {
  return (
    <div className={styles.empty}>
      <Illustration kind={kind} />
      <p className={styles.title}>{title}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {action}
    </div>
  );
}

function Illustration({ kind }: { kind: Kind }) {
  const cells = LAYOUTS[kind];
  return (
    <svg
      className={styles.art}
      viewBox="0 0 84 60"
      width="84"
      height="60"
      fill="none"
      aria-hidden="true"
    >
      {cells.map(([x, y, on]) => (
        <rect
          key={`${String(x)}-${String(y)}`}
          x={x}
          y={y}
          width="16"
          height="16"
          rx="4"
          className={on ? styles.on : styles.off}
        />
      ))}
    </svg>
  );
}

/** [x, y, encendida] sobre una retícula de 4x3 celdas de 16 con 6 de hueco. */
type Cell = [number, number, boolean];

const grid = (pattern: string): Cell[] =>
  pattern
    .trim()
    .split('\n')
    .flatMap((row, y) =>
      row
        .trim()
        .split('')
        .map((char, x): Cell => [x * 22 + 1, y * 22 - 4, char === '#'])
        .filter((_, x) => row.trim()[x] !== ' '),
    );

const LAYOUTS: Record<Kind, Cell[]> = {
  // Una retícula que empieza a llenarse.
  habits: grid(`
    #..
    .#.
    ...
  `),
  // Pocos datos: dos columnas y hueco.
  chart: grid(`
    ..#
    .##
    ###
  `),
  // Calendario con huecos.
  history: grid(`
    #.#
    ..#
    #..
  `),
  // Desconectado: la retícula sigue ahí, sólo que apagada.
  offline: grid(`
    ...
    .#.
    ...
  `),
};
