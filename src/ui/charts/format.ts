/** Formatea minutos como horas y minutos: "120" no dice de que. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${String(hours)} h` : `${String(hours)} h ${String(rest)}`;
}
