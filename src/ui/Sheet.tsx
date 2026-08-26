import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import styles from './Sheet.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel inferior, el patron por defecto de la app en movil.
 *
 * Sobre `<dialog>` nativo a proposito: trae foco atrapado, cierre con Escape y
 * devolucion del foco al elemento que lo abrio, que es la parte con mas trampa
 * de todo el ui-kit y la que peor sale reimplementada a mano.
 */
export function Sheet({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.sheet} onCancel={onClose} onClose={onClose}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
          <Button size="sm" aria-label="Cerrar" onClick={onClose}>
            ✕
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
