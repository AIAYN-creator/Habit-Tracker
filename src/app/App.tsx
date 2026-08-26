import { useState } from 'react';
import { DayEntry } from '@/features/entry/DayEntry';
import { HabitForm } from '@/features/schema/HabitForm';
import { MoodForm } from '@/features/schema/MoodForm';
import { SyncPanel } from '@/features/sync/SyncPanel';
import { Sheet } from '@/ui';

/**
 * `app/` es quien compone: el registro diario y la definicion del schema son
 * dos features distintas y no pueden importarse entre si.
 */
export function App() {
  const [panel, setPanel] = useState<'habits' | 'moods' | 'sync' | null>(null);

  return (
    <>
      <DayEntry
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
        open={panel === 'sync'}
        title="Sincronización"
        onClose={() => {
          setPanel(null);
        }}
      >
        <SyncPanel />
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
    </>
  );
}
