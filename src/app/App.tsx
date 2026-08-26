import { useState } from 'react';
import { DayEntry } from '@/features/entry/DayEntry';
import { ChartsView } from '@/features/charts/ChartsView';
import { History } from '@/features/history/History';
import { HabitForm } from '@/features/schema/HabitForm';
import { MoodForm } from '@/features/schema/MoodForm';
import { SyncPanel } from '@/features/sync/SyncPanel';
import { todayLocal } from '@/lib/date';
import { Button, Sheet } from '@/ui';
import styles from './App.module.css';

/**
 * `app/` es quien compone: registro, historial y schema son features distintas
 * y no pueden importarse entre si. La fecha vive aqui porque la eligen dos.
 */
export function App() {
  const [panel, setPanel] = useState<'habits' | 'moods' | 'sync' | null>(null);
  const [tab, setTab] = useState<'day' | 'history' | 'charts'>('day');
  const [date, setDate] = useState(todayLocal());

  return (
    <div className={styles.app}>
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
          Hoy
        </Button>
        <Button
          variant={tab === 'history' ? 'primary' : 'ghost'}
          aria-current={tab === 'history' ? 'page' : undefined}
          onClick={() => {
            setTab('history');
          }}
        >
          Historial
        </Button>
        <Button
          variant={tab === 'charts' ? 'primary' : 'ghost'}
          aria-current={tab === 'charts' ? 'page' : undefined}
          onClick={() => {
            setTab('charts');
          }}
        >
          Gráficas
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
