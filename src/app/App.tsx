import { useState } from 'react';
import { DayEntry } from '@/features/entry/DayEntry';
import { HabitForm } from '@/features/schema/HabitForm';
import { MoodForm } from '@/features/schema/MoodForm';
import { Sheet } from '@/ui';

/**
 * `app/` es quien compone: el registro diario y la definicion del schema son
 * dos features distintas y no pueden importarse entre si.
 */
export function App() {
  const [panel, setPanel] = useState<'habits' | 'moods' | null>(null);

  return (
    <>
      <DayEntry
        onManage={() => {
          setPanel('habits');
        }}
        onManageMoods={() => {
          setPanel('moods');
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
