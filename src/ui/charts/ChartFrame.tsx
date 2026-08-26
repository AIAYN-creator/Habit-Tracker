import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Size } from './geometry';
import styles from './ChartFrame.module.css';

interface Props {
  title: string;
  /** Resumen para lectores de pantalla: la grafica es role="img". */
  label: string;
  height?: number;
  /** Tabla equivalente, visualmente oculta. Una grafica que solo existe como
      pixeles no existe para un lector de pantalla. */
  table: ReactNode;
  children: (size: Size) => ReactNode;
  footer?: ReactNode;
  empty?: boolean;
}

/**
 * Capa compartida de las graficas: contenedor responsive, titulo, estado vacio
 * y accesibilidad. Ver docs/adr/charts.md.
 */
export function ChartFrame({ title, label, height = 160, table, children, footer, empty }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Medida sincrona al montar: esperar al ResizeObserver deja la grafica en
  // blanco el primer fotograma, y hay entornos donde no llega a disparar.
  useLayoutEffect(() => {
    setWidth(ref.current?.getBoundingClientRect().width ?? 0);
  }, []);

  // El observer solo se encarga de los cambios posteriores.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? 0;
      if (next > 0) setWidth(next);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.title}>{title}</figcaption>
      <div className={styles.canvas} ref={ref}>
        {empty ? (
          <p className={styles.empty}>Vuelve dentro de unos días</p>
        ) : width > 0 ? (
          <svg width={width} height={height} role="img" aria-label={label}>
            {children({ width, height })}
          </svg>
        ) : null}
      </div>
      {footer ? <p className={styles.footer}>{footer}</p> : null}
      <div className={styles.hidden}>{table}</div>
    </figure>
  );
}
