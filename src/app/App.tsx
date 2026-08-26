import { todayLocal, formatLongDate } from '@/lib/date';
import styles from './App.module.css';

export function App() {
  const today = todayLocal();

  return (
    <main className={styles.shell}>
      <h1 className={styles.title}>Habit Tracker</h1>
      <p className={styles.date}>{formatLongDate(today)}</p>
      <p className={styles.muted}>
        Andamiaje en pie. El registro diario llega con la tarjeta <code>entrada</code>.
      </p>
    </main>
  );
}
