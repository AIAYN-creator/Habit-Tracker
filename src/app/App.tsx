import { useEffect, useState } from 'react';
import { DayEntry } from '@/features/entry/DayEntry';
import { ChartsView } from '@/features/charts/ChartsView';
import { History } from '@/features/history/History';
import { HabitForm } from '@/features/schema/HabitForm';
import { MoodForm } from '@/features/schema/MoodForm';
import { SyncPanel } from '@/features/sync/SyncPanel';
import { usePwa } from '@/features/pwa/usePwa';
import { useAutoSync } from '@/features/sync/useAutoSync';
import { ThemePanel } from '@/features/theme/ThemePanel';
import { applyAppearance, applyDensity } from '@/features/theme/theme';
import { db, readAppearance, useLiveQuery } from '@/data';
import { todayLocal } from '@/lib/date';
import { CalendarDays, ChartColumn, Palette, SquareCheckBig } from 'lucide-react';
import { Button, Sheet } from '@/ui';
import styles from './App.module.css';

/**
 * `app/` es quien compone: registro, historial y schema son features distintas
 * y no pueden importarse entre si. La fecha vive aqui porque la eligen dos.
 */
export function App() {
  const [panel, setPanel] = useState<'habits' | 'moods' | 'sync' | 'theme' | null>(null);
  const [tab, setTab] = useState<'day' | 'history' | 'charts'>('day');
  const [date, setDate] = useState(todayLocal());

  useAutoSync();
  const pwa = usePwa();

  // El tema guardado se aplica al arrancar, antes de que el usuario lo toque.
  const appearance = useLiveQuery(() => db.settings.get('appearance'), []);
  const density = useLiveQuery(() => db.settings.get('density'), []);
  useEffect(() => {
    if (appearance !== undefined) applyAppearance(readAppearance(appearance.value));
  }, [appearance]);
  useEffect(() => {
    if (density !== undefined)
      applyDensity(density.value === 'compact' ? 'compact' : 'comfortable');
  }, [density]);

  return (
    <div className={styles.app}>
      {/* Aviso, nunca recarga sola: podria pillarte a media entrada. */}
      {pwa.needsRefresh ? (
        <div className={styles.update} role="status">
          <span>Hay una versión nueva.</span>
          <Button size="sm" variant="primary" onClick={pwa.update}>
            Recargar
          </Button>
        </div>
      ) : null}
      <div className={styles.content}>
        {tab === 'day' ? (
          <DayEntry
            date={date}
            onDateChange={setDate}
            onManage={() => {
              setPanel('habits');
            }}
            onManageMoods={() => {
              setPanel('moods');
            }}
            onSync={() => {
              setPanel('sync');
            }}
          />
        ) : tab === 'charts' ? (
          <ChartsView />
        ) : (
          <History
            onPick={(picked) => {
              setDate(picked);
              setTab('day');
            }}
          />
        )}
      </div>

      <nav className={styles.tabs} aria-label="Secciones">
        <Button
          variant={tab === 'day' ? 'primary' : 'ghost'}
          aria-current={tab === 'day' ? 'page' : undefined}
          onClick={() => {
            setTab('day');
            setDate(todayLocal());
          }}
        >
          <SquareCheckBig size={16} aria-hidden="true" />
          Hoy
        </Button>
        <Button
          variant={tab === 'history' ? 'primary' : 'ghost'}
          aria-current={tab === 'history' ? 'page' : undefined}
          onClick={() => {
            setTab('history');
          }}
        >
          <CalendarDays size={16} aria-hidden="true" />
          Historial
        </Button>
        <Button
          variant={tab === 'charts' ? 'primary' : 'ghost'}
          aria-current={tab === 'charts' ? 'page' : undefined}
          onClick={() => {
            setTab('charts');
          }}
        >
          <ChartColumn size={16} aria-hidden="true" />
          Gráficas
        </Button>
        <Button
          variant={panel === 'theme' ? 'primary' : 'ghost'}
          aria-label="Apariencia"
          onClick={() => {
            setPanel('theme');
          }}
        >
          <Palette size={16} aria-hidden="true" />
        </Button>
      </nav>

      <Sheet
        open={panel === 'habits'}
        title="Hábitos"
        onClose={() => {
          setPanel(null);
        }}
      >
        <HabitForm
          onDone={() => {
            setPanel(null);
          }}
        />
      </Sheet>
      <Sheet
        open={panel === 'moods'}
        title="Estado de ánimo"
        onClose={() => {
          setPanel(null);
        }}
      >
        <MoodForm
          onDone={() => {
            setPanel(null);
          }}
        />
      </Sheet>
      <Sheet
        open={panel === 'theme'}
        title="Apariencia"
        onClose={() => {
          setPanel(null);
        }}
      >
        <ThemePanel />
      </Sheet>
      <Sheet
        open={panel === 'sync'}
        title="Sincronización"
        onClose={() => {
          setPanel(null);
        }}
      >
        <SyncPanel />
      </Sheet>
    </div>
  );
}
