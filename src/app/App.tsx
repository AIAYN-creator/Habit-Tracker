import { useState } from 'react';
import { DayEntry } from '@/features/entry/DayEntry';
import { HabitForm } from '@/features/schema/HabitForm';
import { Sheet } from '@/ui';

/**
 * `app/` es quien compone: el registro diario y el alta de habitos son dos
 * features distintas y no pueden importarse entre si.
 */
export function App() {
  const [managing, setManaging] = useState(false);

  return (
    <>
      <DayEntry
        onManage={() => {
          setManaging(true);
        }}
      />
      <Sheet
        open={managing}
        title="Hábitos"
        onClose={() => {
          setManaging(false);
        }}
      >
        <HabitForm
          onDone={() => {
            setManaging(false);
          }}
        />
      </Sheet>
    </>
  );
}
